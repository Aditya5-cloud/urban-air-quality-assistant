/**
 * @file chat.ts
 * Type definitions for conversational AI chat sessions and messages.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  text?: string;
  content?: string;
  timestamp?: string | number;
}
