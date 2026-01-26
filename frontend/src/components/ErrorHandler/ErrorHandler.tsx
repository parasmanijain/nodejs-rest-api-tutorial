import { FC, Fragment } from "react";
import { Backdrop } from "../Backdrop/Backdrop";
import { Modal } from "../Modal/Modal";

export interface ErrorLike {
  message: string;
}

export interface ErrorHandlerProps {
  error?: ErrorLike | null;
  onHandle: () => void;
}

export const ErrorHandler: FC<ErrorHandlerProps> = ({ error, onHandle }) => (
  <Fragment>
    {error && <Backdrop onClick={onHandle} />}
    {error && (
      <Modal
        title="An Error Occurred"
        onCancelModal={onHandle}
        onAcceptModal={onHandle}
        acceptEnabled
      >
        <p>{error.message}</p>
      </Modal>
    )}
  </Fragment>
);