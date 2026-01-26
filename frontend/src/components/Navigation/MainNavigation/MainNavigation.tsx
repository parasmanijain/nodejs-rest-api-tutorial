import { FC } from "react";
import { NavLink } from "react-router-dom";
import { MobileToggle } from "../MobileToggle/MobileToggle";
import { Logo } from "../../Logo/Logo";
import { NavigationItems } from "../NavigationItems/NavigationItems";
import classes from "./MainNavigation.module.scss";

export interface MainNavigationProps {
  isAuth: boolean;
  onLogout: () => void;
  onOpenMobileNav: () => void;
}

export const MainNavigation: FC<MainNavigationProps> = (props) => (
  <nav className={classes["main-nav"]}>
    <MobileToggle onOpen={props.onOpenMobileNav} />
    <div className={classes["main-nav__logo"]}>
      <NavLink to="/">
        <Logo />
      </NavLink>
    </div>
    <div className={classes["spacer"]} />
    <ul className={classes["main-nav__items"]}>
      <NavigationItems isAuth={props.isAuth} onLogout={props.onLogout} />
    </ul>
  </nav>
);
