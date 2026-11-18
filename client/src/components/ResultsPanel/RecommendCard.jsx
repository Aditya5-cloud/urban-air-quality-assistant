import React from 'react';

function RecommendCard({ title, icon, items, impacts, categoryClass }) {
  if (!items || items.length === 0) return null;

  return (
    <article className={`recommend-card ${categoryClass}`} aria-labelledby={`card-heading-${categoryClass}`}>
      <div className="card-header">
        <span className="card-icon" aria-hidden="true">{icon}</span>
        <h3 id={`card-heading-${categoryClass}`} className="card-title">{title}</h3>
      </div>
      <ul className="recommend-list">
        {items.map((item, index) => {
          const impact = impacts && impacts[index] ? impacts[index] : null;
          return (
            <li key={index} className="recommend-item">
              <p className="recommend-text">{item}</p>
              {impact && (
                <div className="impact-callout" aria-label="Direct impact of this action">
                  <span className="impact-badge" aria-hidden="true">💡 Direct Impact:</span>
                  <span className="impact-text">{impact}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default RecommendCard;
