import { FC } from "react";
import { NavigationItems } from "../NavigationItems/NavigationItems";
import classes from "./MobileNavigation.module.scss";

export interface MobileNavigationProps {
  open?: boolean;
  mobile?: boolean;
  onChooseItem?: () => void;
  isAuth: boolean;
  onLogout: () => void;
}

export const MobileNavigation: FC<MobileNavigationProps> = (props) => {
  const navClassName = [
    classes["mobile-nav"],
    props.open ? classes["open"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const listClassName = [
    classes["mobile-nav__items"],
    props.mobile ? classes["mobile"] : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <nav className={navClassName}>
      <ul className={listClassName}>
        <NavigationItems
          mobile
          onChoose={props.onChooseItem}
          isAuth={props.isAuth}
          onLogout={props.onLogout}
        />
      </ul>
    </nav>
  );
};
