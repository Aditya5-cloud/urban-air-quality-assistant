import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import './ChatWidget.css';

function ChatWidget({ sessionId, initialHistory = [], profileCity }) {
  const [messages, setMessages] = useState(initialHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);
  const logContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    } else if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

    // Prepare prior history (up to last 10 messages) before adding current query
    const historyToSend = messages.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      text: m.text,
    }));

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
          history: historyToSend,
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
            Need adjustments for {profileCity || 'your location'}? Ask about transit, school sports, or filtration.
          </p>
        </div>
        <span className="chat-status-indicator" aria-hidden="true">Domain Guarded</span>
      </div>

      <div className="chat-log-container" ref={logContainerRef}>
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
            <div ref={messagesEndRef} aria-hidden="true" />
          </ul>
        )}
      </div>

      {chatError && (
        <div className="chat-error-inline" role="alert">
          <span>⚠️ {chatError}</span>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSend} noValidate>
        <label htmlFor="chat-user-input" className="sr-only">
          Ask a question about air quality
        </label>
        <input
          id="chat-user-input"
          type="text"
          className="chat-input-field"
          placeholder="Type your question here (e.g. Can we exercise outside this morning?)..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          maxLength={1000}
          autoComplete="off"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputMessage.trim() || isSending}
          aria-label="Send question to AI assistant"
        >
          {isSending ? <span className="chat-spinner" aria-hidden="true"></span> : 'Send ➔'}
        </button>
      </form>
    </section>
  );
}

export default ChatWidget;
