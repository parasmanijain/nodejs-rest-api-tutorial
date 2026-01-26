import React from 'react';
import { createPortal } from 'react-dom';
import Button from '../Button/Button';
import './Modal.scss';

export interface ModalProps {
  title: string;
  children?: React.ReactNode;
  onCancelModal: () => void;
  onAcceptModal: () => void;
  acceptEnabled?: boolean;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = (props) => {
  const root = document.getElementById('modal-root');
  if (!root) return null;

  return createPortal(
    <div className="modal">
      <header className="modal__header">
        <h1>{props.title}</h1>
      </header>
      <div className="modal__content">{props.children}</div>
      <div className="modal__actions">
        <Button design="danger" mode="flat" onClick={props.onCancelModal}>
          Cancel
        </Button>
        <Button
          mode="raised"
          onClick={props.onAcceptModal}
          disabled={!props.acceptEnabled}
          loading={props.isLoading}
        >
          Accept
        </Button>
      </div>
    </div>,
    root
  );
};

export default Modal;