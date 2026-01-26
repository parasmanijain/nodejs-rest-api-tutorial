import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button/Button";
import classes from "./Modal.module.scss";

export interface ModalProps {
  title: string;
  children?: ReactNode;
  onCancelModal: () => void;
  onAcceptModal: () => void;
  acceptEnabled?: boolean;
  isLoading?: boolean;
}

export const Modal: FC<ModalProps> = ({ children, title, onAcceptModal, onCancelModal, acceptEnabled, isLoading }) => {
  const root = document.getElementById("modal-root");
  if (!root) return null;

  return createPortal(
    <div className={classes["modal"]}>
      <header className={classes["modal__header"]}>
        <h1>{title}</h1>
      </header>
      <div className={classes["modal__content"]}>{children}</div>
      <div className={classes["modal__actions"]}>
        <Button design="danger" mode="flat" onClick={onCancelModal}>
          Cancel
        </Button>
        <Button
          mode="raised"
          onClick={onAcceptModal}
          disabled={!acceptEnabled}
          loading={isLoading}
        >
          Accept
        </Button>
      </div>
    </div>,
    root,
  );
};
