import type { Message } from "ai";
import {
  streamText,
  createDataStreamResponse,
  appendResponseMessages,
} from "ai";
import { model } from "~/model";
import { auth } from "~/server/auth";
import { searchSerper } from "~/serper";
import { bulkCrawlWebsites } from "~/server/scraper";
import { cacheWithRedis } from "~/server/redis/redis";
import { z } from "zod";
import { upsertChat } from "~/server/db/queries";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";
import { Langfuse } from "langfuse";
import { env } from "~/env";

const langfuse = new Langfuse({
  environment: env.NODE_ENV,
});

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as {
    messages: Array<Message>;
    chatId?: string;
  };

  const { messages, chatId } = body;

  if (!messages.length) {
    return new Response("No messages provided", { status: 400 });
  }

  // If no chatId is provided, create a new chat with the user's message
  let currentChatId = chatId;
  if (!currentChatId) {
    const newChatId = crypto.randomUUID();
    await upsertChat({
      userId: session.user.id,
      chatId: newChatId,
      title: messages[messages.length - 1]!.content.slice(0, 50) + "...",
      messages: messages, // Only save the user's message initially
    });
    currentChatId = newChatId;
  } else {
    // Verify the chat belongs to the user
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, currentChatId),
    });
    if (!chat || chat.userId !== session.user.id) {
      return new Response("Chat not found or unauthorized", { status: 404 });
    }
  }

  // Create a trace with user and session information
  const trace = langfuse.trace({
    sessionId: currentChatId,
    name: "chat",
    userId: session.user.id,
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // If this is a new chat, send the chat ID to the frontend
      if (!chatId) {
        dataStream.writeData({
          type: "NEW_CHAT_CREATED",
          chatId: currentChatId,
        });
      }

      // Get current date and time for context
      const currentDate = new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });

      const result = streamText({
        model,
        messages,
        maxSteps: 10,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "agent",
          metadata: {
            langfuseTraceId: trace.id,
          },
        },
        system: `You are a helpful AI assistant with access to real-time web search capabilities and web scraping tools. 

CURRENT DATE AND TIME: ${currentDate}

When answering questions:

1. Always search the web for up-to-date information when relevant
2. ALWAYS format URLs as markdown links using the format [title](url)
3. Be thorough but concise in your responses
4. If you're unsure about something, search the web to verify
5. When providing information, always include the source where you found it using markdown links
6. Never include raw URLs - always use markdown link format
7. CRITICAL: After using the searchWeb tool, you MUST ALWAYS use the scrapePages tool to extract the full content from the most relevant search results
8. This ensures you have the most up-to-date and detailed information from the actual web pages
9. Use the scrapePages tool to extract detailed information from articles, documentation, or other content-rich pages
10. IMPORTANT: When users ask for "up to date" information, current events, recent news, or time-sensitive data, always reference the current date (${currentDate}) and compare it with publication dates from search results to provide context about how recent the information is
11. When search results include publication dates, mention them to help users understand the timeliness of the information

IMPORTANT WORKFLOW:
1. Use searchWeb to find relevant pages
2. ALWAYS follow up with scrapePages using 4-6 diverse URLs from the search results
3. Select URLs from different sources and perspectives to ensure comprehensive coverage
4. Use the scraped content to provide accurate, detailed responses with proper source attribution
5. When discussing time-sensitive topics, always reference the current date and publication dates from sources

This two-step process ensures you have the most current and comprehensive information available from multiple diverse sources.`,
        tools: {
          searchWeb: {
            parameters: z.object({
              query: z.string().describe("The query to search the web for"),
            }),
            execute: async ({ query }, { abortSignal }) => {
              const results = await searchSerper(
                { q: query, num: 10 },
                abortSignal,
              );

              return results.organic.map((result) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
              }));
            },
          },
          scrapePages: {
            parameters: z.object({
              urls: z
                .array(z.string())
                .describe("Array of URLs to scrape for full content"),
            }),
            execute: cacheWithRedis(
              "scrapePages",
              async ({ urls }, { abortSignal }) => {
                const result = await bulkCrawlWebsites({ urls });

                if (!result.success) {
                  return {
                    error: result.error,
                    results: result.results.map(
                      ({ url, result: crawlResult }) => ({
                        url,
                        success: crawlResult.success,
                        content: crawlResult.success
                          ? crawlResult.data
                          : crawlResult.error,
                      }),
                    ),
                  };
                }

                return {
                  success: true,
                  results: result.results.map(
                    ({ url, result: crawlResult }) => ({
                      url,
                      content: crawlResult.data,
                    }),
                  ),
                };
              },
            ),
          },
        },
        onFinish: async ({ response }) => {
          // Merge the existing messages with the response messages
          const updatedMessages = appendResponseMessages({
            messages,
            responseMessages: response.messages,
          });

          const lastMessage = messages[messages.length - 1];
          if (!lastMessage) {
            return;
          }

          // Save the complete chat history
          await upsertChat({
            userId: session.user.id,
            chatId: currentChatId,
            title: lastMessage.content.slice(0, 50) + "...",
            messages: updatedMessages,
          });

          // Flush the trace to Langfuse
          await langfuse.flushAsync();
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (e) => {
      console.error(e);
      return "Oops, an error occurred!";
    },
  });
}
