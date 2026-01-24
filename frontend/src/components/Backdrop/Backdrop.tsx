
import { createPortal } from 'react-dom';
import './Backdrop.scss';

export const Backdrop = props =>
  createPortal(
    <div
      className={['backdrop', props.open ? 'open' : ''].join(' ')}
      onClick={props.onClick}
    />,
    document.getElementById('backdrop-root')
  );
