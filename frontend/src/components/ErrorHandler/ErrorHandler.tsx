import { Fragment } from 'react';
import { Backdrop } from '../Backdrop/Backdrop.tsx';
import { Modal } from '../Modal/Modal.tsx';

export const ErrorHandler = props => (
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
