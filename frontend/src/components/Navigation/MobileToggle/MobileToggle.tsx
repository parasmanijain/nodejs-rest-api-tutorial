import { FC } from "react";
import classes from "./MobileToggle.module.scss";

export interface MobileToggleProps {
  onOpen: () => void;
}

export const MobileToggle: FC<MobileToggleProps> = ({ onOpen }) => (
  <button className={classes["mobile-toggle"]} onClick={onOpen}>
    <span className={classes["mobile-toggle__bar"]} />
    <span className={classes["mobile-toggle__bar"]} />
    <span className={classes["mobile-toggle__bar"]} />
  </button>
);
