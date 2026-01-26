import React, { Fragment } from 'react';

import Backdrop from '../Backdrop/Backdrop';
import Modal from '../Modal/Modal';

export interface ErrorLike {
  message: string;
}

export interface ErrorHandlerProps {
  error?: ErrorLike | null;
  onHandle: () => void;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = (props) => (
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

export default ErrorHandler;