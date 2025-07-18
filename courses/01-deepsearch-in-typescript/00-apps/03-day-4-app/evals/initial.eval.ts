import { evalite } from "evalite";
import { askDeepSearch } from "~/deep-search";
import type { Message } from "ai";

evalite("Deep Search Eval", {
  data: async (): Promise<{ input: Message[]; expected: string }[]> => {
    return [
      {
        input: [
          {
            id: "1",
            role: "user",
            content: "What is the latest version of TypeScript?",
          },
        ],
        expected: "The latest version of TypeScript is 5.7.3.",
      },
      {
        input: [
          {
            id: "2",
            role: "user",
            content: "What are the main features of Next.js 14?",
          },
        ],
        expected:
          "Next.js 14 is a framework for building server-side rendered React applications. It is the latest version of Next.js and has many new features.",
      },
    ];
  },
  task: async (input) => {
    return askDeepSearch(input);
  },
  scorers: [
    {
      name: "Contains Links",
      description: "Checks if the output contains any markdown links.",
      scorer: ({ output }) => {
        const containsLinks = /\[.*?\]\(.*?\)/.test(output);

        return containsLinks ? 1 : 0;
      },
    },
  ],
});
