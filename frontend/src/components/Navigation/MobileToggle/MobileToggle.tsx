import { FC } from "react";
import classes from "./MobileToggle.module.scss";

export interface MobileToggleProps {
  onOpen: () => void;
}

export const MobileToggle: FC<MobileToggleProps> = (props) => (
  <button className={classes["mobile-toggle"]} onClick={props.onOpen}>
    <span className={classes["mobile-toggle__bar"]} />
    <span className={classes["mobile-toggle__bar"]} />
    <span className={classes["mobile-toggle__bar"]} />
  </button>
);
