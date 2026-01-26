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

export const MobileNavigation: FC<MobileNavigationProps> = ({ mobile, onLogout, isAuth, open, onChooseItem }) => {
  const navClassName = [
    classes["mobile-nav"],
    open ? classes["open"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const listClassName = [
    classes["mobile-nav__items"],
    mobile ? classes["mobile"] : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <nav className={navClassName}>
      <ul className={listClassName}>
        <NavigationItems
          mobile
          onChoose={onChooseItem}
          isAuth={isAuth}
          onLogout={onLogout}
        />
      </ul>
    </nav>
  );
};
