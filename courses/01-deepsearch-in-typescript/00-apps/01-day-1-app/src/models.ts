import { google } from "@ai-sdk/google";

// Available Google Gemini models:
// - "gemini-2.5-flash" - Latest model with thinking capabilities (best price/performance)
// - "gemini-2.0-flash-001" - Supports tool calling, good for development
// - "gemini-1.5-flash" - Legacy model, Google recommends migrating to 2.0 Flash
// - "gemini-1.5-pro" - Legacy model, being deprecated
// - "gemini-2.5-pro" - Most capable model for complex tasks

// Using gemini-2.0-flash-001 as recommended for tool calling support
export const model = google("gemini-2.0-flash-001");

// You can experiment with different models by changing the string above:
// export const model = google("gemini-2.5-flash");
// export const model = google("gemini-1.5-flash");
// export const model = google("gemini-1.5-pro");
