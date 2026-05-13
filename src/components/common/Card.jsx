import React from 'react';
import './ui.css';

const Card = ({ children, className = '', ...props }) => {
  return (
    <section className={`card ${className}`.trim()} {...props}>
      {children}
    </section>
  );
};

export default Card;
