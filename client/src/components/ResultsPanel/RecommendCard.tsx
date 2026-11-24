import React, { memo } from 'react';

export interface RecommendCardProps {
  title: string;
  subtitle?: string | null;
  icon: string;
  items: string[];
  impacts?: string[];
  categoryClass: string;
}

function RecommendCard({
  title,
  subtitle = null,
  icon,
  items,
  impacts = [],
  categoryClass,
}: RecommendCardProps): React.ReactElement | null {
  if (!items || items.length === 0) return null;

  return (
    <article className={`recommend-card ${categoryClass}`} aria-labelledby={`card-heading-${categoryClass}`}>
      <div className="card-header">
        <div className="card-header-icon-wrap" aria-hidden="true">
          <span className="card-icon">{icon}</span>
        </div>
        <div className="card-header-text">
          <h3 id={`card-heading-${categoryClass}`} className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>

      <ul className="recommend-list">
        {items.map((item, index) => {
          // Parse "Action: Reason" format if present for clean visual separation
          const hasColon = typeof item === 'string' && item.includes(':');
          let actionText = item;
          let reasonText: string | null = null;

          if (hasColon) {
            const parts = item.split(':');
            actionText = parts[0].trim();
            reasonText = parts.slice(1).join(':').trim();
          }

          return (
            <li key={`${categoryClass}-item-${index}`} className="recommend-item">
              <div className="item-check-icon" aria-hidden="true">✓</div>
              <div className="item-content">
                <span className="recommend-action">{actionText}</span>
                {reasonText && <p className="recommend-reason">{reasonText}</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {impacts && impacts.length > 0 && impacts[0] && (
        <div className="card-impact-footer" role="note" aria-label="Direct benefit of these steps">
          <span className="impact-footer-badge" aria-hidden="true">🌱 Direct Payoff:</span>
          <span className="impact-footer-text">{impacts[0]}</span>
        </div>
      )}
    </article>
  );
}

export default memo(RecommendCard);
