import { NavLink } from 'react-router-dom';
import { MobileToggle } from '../MobileToggle/MobileToggle';
import { Logo } from '../../Logo/Logo';
import { NavigationItems } from '../NavigationItems/NavigationItems';
import './MainNavigation.scss';

interface MainNavigationProps {
  onOpenMobileNav: () => void;
  onLogout: () => void;
  isAuth: boolean;
}

export const MainNavigation = (props: MainNavigationProps) => (
  <nav className="main-nav">
    <MobileToggle onOpen={props.onOpenMobileNav} />
    <div className="main-nav__logo">
      <NavLink to="/">
        <Logo />
      </NavLink>
    </div>
    <div className="spacer" />
    <ul className="main-nav__items">
      <NavigationItems isAuth={props.isAuth} onLogout={props.onLogout} />
    </ul>
  </nav>
);