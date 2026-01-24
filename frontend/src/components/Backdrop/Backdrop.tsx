import { createPortal } from 'react-dom';
import './Backdrop.scss';

interface BackdropProps {
  open?: boolean;
  onClick: () => void;
}

export const Backdrop = (props: BackdropProps) =>
  createPortal(
    <div
      className={['backdrop', props.open ? 'open' : ''].join(' ')}
      onClick={props.onClick}
    />,
    document.getElementById('backdrop-root')!
  );