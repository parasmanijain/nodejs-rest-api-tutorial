import React from 'react';
import { createPortal } from 'react-dom';
import './Backdrop.scss';

export interface BackdropProps {
  open?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Backdrop: React.FC<BackdropProps> = ({ open, onClick }) => {
  const root = document.getElementById('backdrop-root');
  if (!root) return null;
  return createPortal(
    <div
      className={['backdrop', open ? 'open' : ''].join(' ')}
      onClick={onClick}
    />,
    root
  );
};

export default Backdrop;