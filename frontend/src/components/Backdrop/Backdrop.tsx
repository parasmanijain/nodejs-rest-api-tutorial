import { FC, MouseEventHandler } from "react";
import { createPortal } from "react-dom";
import classes from "./Backdrop.module.scss";

export interface BackdropProps {
  open?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const Backdrop: FC<BackdropProps> = ({ open, onClick }) => {
  const root = document.getElementById("backdrop-root");
  if (!root) return null;
  const className = [classes['backdrop'], open ? classes['open'] : '']
    .filter(Boolean)
    .join(' ');
  return createPortal(
    <div
      className={className}
      onClick={onClick}
    />,
    root,
  );
};