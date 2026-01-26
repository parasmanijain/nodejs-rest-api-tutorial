import { FC, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import classes from "./NavigationItems.module.scss";

type NavItem = { id: string; text: string; link: string; auth: boolean };

const navItems: NavItem[] = [
  { id: "feed", text: "Feed", link: "/", auth: true },
  { id: "login", text: "Login", link: "/", auth: false },
  { id: "signup", text: "Signup", link: "/signup", auth: false },
];

export interface NavigationItemsProps {
  isAuth: boolean;
  mobile?: boolean;
  onChoose?: () => void;
  onLogout: () => void;
}

export const NavigationItems: FC<NavigationItemsProps> = ({ isAuth, mobile, onLogout, onChoose }) => {
  const liClassName = [
    classes['navigation-item'],
    mobile ? classes['mobile'] : ''
  ]
    .filter(Boolean)
    .join(' ');
  const items = [
    ...navItems
      .filter((item) => item.auth === isAuth)
      .map((item) => (
        <li
          key={item.id}
          className={liClassName}
        >
          <NavLink to={item.link} onClick={onChoose}>
            {item.text}
          </NavLink>
        </li>
      )),
    isAuth && (
      <li className={classes["navigation-item"]} key="logout">
        <button onClick={onLogout}>Logout</button>
      </li>
    ),
  ].filter(Boolean) as ReactNode[];

  return <>{items}</>;
};
