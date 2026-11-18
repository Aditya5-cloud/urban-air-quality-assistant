import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import './ChatWidget.css';

function ChatWidget({ sessionId, initialHistory = [], profileCity }) {
  const [messages, setMessages] = useState(initialHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setChatError(null);

    const userMessage = { role: 'user', text: trimmed, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: trimmed,
          history: updatedMessages.slice(-10), // Cap context to last 10 messages
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to obtain AI response');
      }

      const assistantMessage = {
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setChatError(err.message || 'Chat service encountered an error.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="chat-widget" aria-labelledby="chat-heading">
      <div className="chat-header">
        <div>
          <h3 id="chat-heading" className="chat-title">
            Ask Questions & Refine Your Plan
          </h3>
          <p className="chat-subtitle">
            Need adjustments for {profileCity || 'your location'}? Ask about transit delays, school sports, or budget air filtration.
          </p>
        </div>
        <span className="chat-status-indicator" aria-hidden="true">Multi-Turn AI Active</span>
      </div>

      <div className="chat-log-container">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <p>💡 <em>Example questions you can ask:</em></p>
            <ul className="suggestions-list">
              <li>&ldquo;What should my children do if their school holds morning outdoor assembly?&rdquo;</li>
              <li>&ldquo;How can I construct an affordable DIY Corsi-Rosenthal filter box?&rdquo;</li>
              <li>&ldquo;What are the best indoor plants to complement mechanical ventilation?&rdquo;</li>
            </ul>
          </div>
        ) : (
          <ul className="chat-bubbles-list" role="log" aria-live="polite" aria-label="Conversation messages">
            {messages.map((msg, index) => (
              <ChatBubble key={index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>

      {chatError && (
        <div className="chat-error-banner" role="alert">
          <p>{chatError}</p>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSend}>
        <div className="chat-input-wrapper">
          <label htmlFor="chat-textarea" className="sr-only">
            Your follow-up question
          </label>
          <textarea
            id="chat-textarea"
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here... (Press Enter to send, Shift+Enter for newline)"
            className="chat-textarea"
            maxLength={500}
            disabled={isSending}
            aria-describedby="chat-char-count"
          />
          <div id="chat-char-count" className="chat-char-count">
            {inputMessage.length}/500
          </div>
        </div>

        <button
          type="submit"
          className="chat-send-button"
          disabled={isSending || !inputMessage.trim()}
          aria-label={isSending ? 'Sending question to AI' : 'Send question'}
        >
          {isSending ? 'Thinking...' : 'Send ➔'}
        </button>
      </form>
    </section>
  );
}

export default ChatWidget;
