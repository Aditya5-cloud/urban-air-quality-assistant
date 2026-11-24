import React, { useState } from 'react';

export interface ShareLinkProps {
  sessionId: string;
}

/**
 * ShareLink provides a copy-to-clipboard shareable session URL.
 * Session links are active for 7 days via the in-memory TTL repository.
 */
const ShareLink: React.FC<ShareLinkProps> = ({ sessionId }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?session=${sessionId}`
    : `?session=${sessionId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback if clipboard API is blocked
      const input = document.getElementById('share-url-input') as HTMLInputElement | null;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    }
  };

  return (
    <div className="share-link-container" aria-label="Shareable plan link">
      <div className="share-link-header">
        <span className="share-icon" aria-hidden="true">🔗</span>
        <label htmlFor="share-url-input" className="share-label">
          Shareable Session Link (Active for 7 Days)
        </label>
      </div>
      <div className="share-input-group">
        <input
          id="share-url-input"
          type="text"
          readOnly
          value={shareUrl}
          className="share-input"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={handleCopy}
          className={`share-copy-button ${copied ? 'copied' : ''}`}
          aria-label={copied ? 'Link copied to clipboard' : 'Copy plan link to clipboard'}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>
      <div className="sr-only" aria-live="polite">
        {copied ? 'Plan link copied to clipboard successfully' : ''}
      </div>
    </div>
  );
};

export default ShareLink;
