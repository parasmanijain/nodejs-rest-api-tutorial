import { NavigationItems } from '../NavigationItems/NavigationItems';
import './MobileNavigation.scss';

interface MobileNavigationProps {
  open: boolean;
  mobile: boolean;
  onChooseItem: () => void;
  onLogout: () => void;
  isAuth: boolean;
}

export const MobileNavigation = (props: MobileNavigationProps) => (
  <nav className={['mobile-nav', props.open ? 'open' : ''].join(' ')}>
    <ul
      className={['mobile-nav__items', props.mobile ? 'mobile' : ''].join(' ')}
    >
      <NavigationItems
        mobile
        onChoose={props.onChooseItem}
        isAuth={props.isAuth}
        onLogout={props.onLogout}
      />
    </ul>
  </nav>
);