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

export const Button: FC<ButtonProps> = ({
  mode,
  onClick,
  disabled,
  loading,
  type,
  link,
  children,
  design,
}) => {
  const className = [
    classes.button,
    design ? classes[`button--${design}`] : "",
    mode ? classes[`button--${mode}`] : "",
  ]
    .filter(Boolean)
    .join(" ");
  return !link ? (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? "Loading..." : children}
    </button>
  ) : (
    <Link className={className} to={link}>
      {children}
    </Link>
  );
};
