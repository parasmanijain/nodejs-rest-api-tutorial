import React from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.scss';

type NavItem = { id: string; text: string; link: string; auth: boolean };

const navItems: NavItem[] = [
  { id: 'feed', text: 'Feed', link: '/', auth: true },
  { id: 'login', text: 'Login', link: '/', auth: false },
  { id: 'signup', text: 'Signup', link: '/signup', auth: false }
];

export interface NavigationItemsProps {
  isAuth: boolean;
  mobile?: boolean;
  onChoose?: () => void;
  onLogout: () => void;
}

const NavigationItems: React.FC<NavigationItemsProps> = (props) => {
  const items = [
    ...navItems
      .filter((item) => item.auth === props.isAuth)
      .map((item) => (
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
  ].filter(Boolean) as JSX.Element[];

  return <>{items}</>;
};

export default NavigationItems;