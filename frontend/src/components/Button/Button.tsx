import React from 'react';
import { Link } from 'react-router-dom';

import './Button.scss';

export interface ButtonProps {
  design?: string;
  mode?: 'flat' | 'raised';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  link?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = (props) => {
  const classes = [
    'button',
    props.design ? `button--${props.design}` : '',
    props.mode ? `button--${props.mode}` : ''
  ]
    .filter(Boolean)
    .join(' ');

  return !props.link ? (
    <button
      className={classes}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      type={props.type}
    >
      {props.loading ? 'Loading...' : props.children}
    </button>
  ) : (
    <Link className={classes} to={props.link}>
      {props.children}
    </Link>
  );
};

export default Button;