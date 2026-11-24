import React from 'react';
import { ChatMessage } from '../../types';

export interface ChatBubbleProps {
  message: ChatMessage;
}

/**
 * ChatBubble renders a single message in the conversation log.
 * Applies distinct styling for 'user' vs 'assistant' roles.
 */
const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const messageText = message.text || message.content || '';

  return (
    <li
      className={`chat-bubble-item ${isUser ? 'chat-user' : 'chat-assistant'}`}
      aria-label={isUser ? 'You said:' : 'Assistant advised:'}
    >
      <div className="chat-bubble-content">
        <div className="chat-bubble-header">
          <span className="speaker-label">{isUser ? '👤 You' : '🍃 Air Quality Assistant'}</span>
        </div>
        <p className="chat-bubble-text">{messageText}</p>
      </div>
    </li>
  );
};

export default ChatBubble;
