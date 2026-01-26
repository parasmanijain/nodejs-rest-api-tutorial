import { FC, MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router-dom";
import classes from "./Button.module.scss";

export interface ButtonProps {
  design?: string;
  mode?: "flat" | "raised";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  link?: string;
  children?: ReactNode;
}

export const Button: FC<ButtonProps> = (props) => {
  const className = [
    classes.button,
    props.design ? classes[`button--${props.design}`] : '',
    props.mode ? classes[`button--${props.mode}`] : ''
  ]
    .filter(Boolean)
    .join(' ');
  return !props.link ? (
    <button
      className={className}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      type={props.type}
    >
      {props.loading ? "Loading..." : props.children}
    </button>
  ) : (
    <Link className={className} to={props.link}>
      {props.children}
    </Link>
  );
};
