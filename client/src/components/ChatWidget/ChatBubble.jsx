import React from 'react';

function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <li
      className={`chat-bubble-item ${isUser ? 'chat-user' : 'chat-assistant'}`}
      aria-label={isUser ? 'You said:' : 'Assistant advised:'}
    >
      <div className="chat-bubble-content">
        <div className="chat-bubble-header">
          <span className="speaker-label">{isUser ? '👤 You' : '🍃 Air Quality Assistant'}</span>
        </div>
        <p className="chat-bubble-text">{message.text}</p>
      </div>
    </li>
  );
}

export default ChatBubble;
