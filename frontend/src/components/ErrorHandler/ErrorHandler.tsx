import { Fragment } from 'react';
import { Backdrop } from '../Backdrop/Backdrop';
import { Modal } from '../Modal/Modal';

interface ErrorHandlerProps {
  error: Error | null;
  onHandle: () => void;
}

export const ErrorHandler = (props: ErrorHandlerProps) => (
  <Fragment>
    {props.error && <Backdrop onClick={props.onHandle} />}
    {props.error && (
      <Modal
        title="An Error Occurred"
        onCancelModal={props.onHandle}
        onAcceptModal={props.onHandle}
        acceptEnabled
      >
        <p>{props.error.message}</p>
      </Modal>
    )}
  </Fragment>
);