import {createPortal} from 'react-dom';
import './Backdrop.scss';

const backdrop = props =>
  createPortal(
    <div
      className={['backdrop', props.open ? 'open' : ''].join(' ')}
      onClick={props.onClick}
    />,
    document.getElementById('backdrop-root')
  );

export default backdrop;
