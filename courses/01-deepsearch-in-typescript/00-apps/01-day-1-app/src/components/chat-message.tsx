import ReactMarkdown, { type Components } from "react-markdown";
import type { Message } from "ai";
import { Search, Loader2, CheckCircle } from "lucide-react";

export type MessagePart = NonNullable<Message["parts"]>[number];

interface ChatMessageProps {
  parts: MessagePart[];
  role: string;
  userName: string;
}

const components: Components = {
  // Override default elements with custom styling
  p: ({ children }) => <p className="mb-4 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-4">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ className, children, ...props }) => (
    <code className={`${className ?? ""}`} {...props}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-700 p-4">
      {children}
    </pre>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-blue-400 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

const Markdown = ({ children }: { children: string }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

const ToolInvocationPart = ({ part }: { part: MessagePart }) => {
  if (part.type !== "tool-invocation") return null;

  const { toolInvocation } = part;

  const renderToolCall = () => {
    return (
      <div className="mb-3 rounded-lg border border-gray-600 bg-gray-700 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Search className="size-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">
            Searching for: {toolInvocation.args.query}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          Tool: {toolInvocation.toolName}
        </div>
      </div>
    );
  };

  const renderToolResult = () => {
    if (toolInvocation.state !== "result") return null;

    const results = toolInvocation.result as Array<{
      title: string;
      link: string;
      snippet: string;
    }>;

    return (
      <div className="mb-3 rounded-lg border border-green-600 bg-gray-700 p-3">
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle className="size-4 text-green-400" />
          <span className="text-sm font-medium text-gray-300">
            Found {results.length} results
          </span>
        </div>
        <div className="space-y-2">
          {results.slice(0, 3).map((result, index) => (
            <div key={index} className="text-xs">
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {result.title}
              </a>
              <p className="mt-1 text-gray-400">{result.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPartialCall = () => {
    return (
      <div className="mb-3 rounded-lg border border-yellow-600 bg-gray-700 p-3">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-yellow-400" />
          <span className="text-sm text-gray-300">Searching...</span>
        </div>
      </div>
    );
  };

  switch (toolInvocation.state) {
    case "partial-call":
      return renderPartialCall();
    case "call":
      return renderToolCall();
    case "result":
      return (
        <>
          {renderToolCall()}
          {renderToolResult()}
        </>
      );
    default:
      return null;
  }
};

const TextPart = ({ part }: { part: MessagePart }) => {
  if (part.type !== "text") return null;
  return <Markdown>{part.text}</Markdown>;
};

const MessagePartRenderer = ({ part }: { part: MessagePart }) => {
  switch (part.type) {
    case "text":
      return <TextPart part={part} />;
    case "tool-invocation":
      return <ToolInvocationPart part={part} />;
    default:
      // For now, we'll ignore other part types as specified in requirements
      return null;
  }
};

export const ChatMessage = ({ parts, role, userName }: ChatMessageProps) => {
  const isAI = role === "assistant";

  return (
    <div className="mb-6">
      <div
        className={`rounded-lg p-4 ${
          isAI ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-gray-300"
        }`}
      >
        <p className="mb-2 text-sm font-semibold text-gray-400">
          {isAI ? "AI" : userName}
        </p>

        <div className="prose prose-invert max-w-none">
          {parts.map((part, index) => (
            <MessagePartRenderer key={index} part={part} />
          ))}
        </div>
      </div>
    </div>
  );
};
