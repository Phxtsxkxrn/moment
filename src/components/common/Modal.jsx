import React from 'react';
import './ui.css';

const Modal = ({ title, children, footer, onClose, className = '' }) => {
  return (
    <div className={`modal-overlay ${className}`.trim()}>
      <div className="modal">
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>
  );
};

export default Modal;
