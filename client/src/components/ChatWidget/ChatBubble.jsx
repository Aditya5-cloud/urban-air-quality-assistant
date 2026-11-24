import React from 'react';
import PropTypes from 'prop-types';

/**
 * ChatBubble renders a single message in the conversation log.
 * Applies distinct styling for 'user' vs 'assistant' roles.
 */
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

ChatBubble.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.oneOf(['user', 'assistant']).isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
  }).isRequired,
};

export default ChatBubble;
