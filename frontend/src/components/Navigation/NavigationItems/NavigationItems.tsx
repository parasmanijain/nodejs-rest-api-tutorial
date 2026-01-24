import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationItems.scss';

interface NavigationItem {
  id: string;
  text: string;
  link: string;
  auth: boolean;
}

interface NavigationItemsProps {
  isAuth: boolean;
  onLogout: () => void;
  mobile?: boolean;
  onChoose?: () => void;
}

const navItems: NavigationItem[] = [
  { id: 'feed', text: 'Feed', link: '/', auth: true },
  { id: 'login', text: 'Login', link: '/', auth: false },
  { id: 'signup', text: 'Signup', link: '/signup', auth: false }
];

export const NavigationItems = (props: NavigationItemsProps): ReactNode[] => [
  ...navItems.filter(item => item.auth === props.isAuth).map(item => (
    <li
      key={item.id}
      className={['navigation-item', props.mobile ? 'mobile' : ''].join(' ')}
    >
      <NavLink to={item.link} onClick={props.onChoose}>
        {item.text}
      </NavLink>
    </li>
  )),
  props.isAuth && (
    <li className="navigation-item" key="logout">
      <button onClick={props.onLogout}>Logout</button>
    </li>
  )
];