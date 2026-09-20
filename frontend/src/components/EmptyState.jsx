import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty-state animate-fade-up">
    <div className="empty-state__icon animate-float">
      {icon}
    </div>
    <h3 className="empty-state__title">{title}</h3>
    <p className="empty-state__desc">{description}</p>
    {action && <div className="empty-state__action">{action}</div>}
  </div>
);

export default EmptyState;
