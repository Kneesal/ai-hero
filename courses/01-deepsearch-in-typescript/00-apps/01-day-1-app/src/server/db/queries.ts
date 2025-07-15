import { eq, desc, and } from "drizzle-orm";
import type { Message } from "ai";

import { db } from "./index";
import { chats, messages, users } from "./schema";

export const upsertChat = async (opts: {
  userId: string;
  chatId: string;
  title: string;
  messages: Message[];
}) => {
  const { userId, chatId, title, messages: messageList } = opts;

  // Verify the user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if chat exists and belongs to the user
  const existingChat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
  });

  if (existingChat && existingChat.userId !== userId) {
    throw new Error("Chat does not belong to user");
  }

  // Use a transaction to ensure data consistency
  return await db.transaction(async (tx) => {
    if (existingChat) {
      // Delete existing messages
      await tx.delete(messages).where(eq(messages.chatId, chatId));

      // Update chat
      await tx
        .update(chats)
        .set({
          title,
          updatedAt: new Date(),
        })
        .where(eq(chats.id, chatId));
    } else {
      // Create new chat
      await tx.insert(chats).values({
        id: chatId,
        title,
        userId,
      });
    }

    // Insert all messages
    if (messageList.length > 0) {
      await tx.insert(messages).values(
        messageList.map((message, index) => ({
          chatId,
          role: message.role,
          parts: message.parts,
          order: index,
        })),
      );
    }

    return { chatId, title };
  });
};

export const getChat = async (opts: { userId: string; chatId: string }) => {
  const { userId, chatId } = opts;

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
    with: {
      messages: {
        orderBy: [messages.order],
      },
    },
  });

  if (!chat) {
    return null;
  }

  // Convert database messages back to AI SDK Message format
  const aiMessages: Message[] = chat.messages.map((msg) => ({
    id: msg.id.toString(),
    role: msg.role as "user" | "assistant" | "system",
    parts: msg.parts as Message["parts"],
    content: "",
  }));

  return {
    id: chat.id,
    title: chat.title,
    messages: aiMessages,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
};

export const getChats = async (opts: { userId: string }) => {
  const { userId } = opts;

  const chatList = await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: [desc(chats.updatedAt)],
  });

  return chatList.map((chat) => ({
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  }));
};
