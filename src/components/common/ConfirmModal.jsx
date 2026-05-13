import React from 'react';
import Modal from './Modal';
import Button from './Button';
import './ui.css';

const ConfirmModal = ({
  title = 'Confirm action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <div className="confirm-modal__footer">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="confirm-modal__content">
        <p>{description}</p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
