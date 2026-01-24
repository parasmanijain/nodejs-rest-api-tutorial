import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Button.scss';

interface ButtonProps {
  children: ReactNode;
  design?: 'flat' | 'raised' | 'accent' | 'danger' | 'success';
  mode?: 'flat' | 'raised';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  link?: string;
}

export const Button = (props: ButtonProps) =>
  !props.link ? (
    <button
      className={[
        'button',
        `button--${props.design}`,
        `button--${props.mode}`
      ].join(' ')}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      type={props.type}
    >
      {props.loading ? 'Loading...' : props.children}
    </button>
  ) : (
    <Link
      className={[
        'button',
        `button--${props.design}`,
        `button--${props.mode}`
      ].join(' ')}
      to={props.link}
    >
      {props.children}
    </Link>
  );