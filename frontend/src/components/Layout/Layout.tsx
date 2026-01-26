import { FC, Fragment, ReactNode } from "react";
import classes from "./Layout.module.scss";

export interface LayoutProps {
  header?: ReactNode;
  mobileNav?: ReactNode;
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ header, mobileNav, children }) => (
  <Fragment>
    <header className={classes["main-header"]}>{header}</header>
    {mobileNav}
    <main className={classes["content"]}>{children}</main>
  </Fragment>
);
