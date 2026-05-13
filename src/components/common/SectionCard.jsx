import React from 'react';
import Card from './Card';
import './ui.css';

const SectionCard = ({
  title,
  subtitle,
  actions,
  className = '',
  children,
  ...props
}) => {
  return (
    <Card className={`section-card ${className}`.trim()} {...props}>
      <div className="section-card__header">
        <div>
          {title && <h2 className="section-card__title">{title}</h2>}
          {subtitle && <p className="section-card__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="section-card__actions">{actions}</div>}
      </div>
      <div className="section-card__body">{children}</div>
    </Card>
  );
};

export default SectionCard;
