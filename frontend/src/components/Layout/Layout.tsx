import { FC, Fragment, ReactNode } from "react";
import classes from "./Layout.module.scss";

export interface LayoutProps {
  header?: ReactNode;
  mobileNav?: ReactNode;
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = (props) => (
  <Fragment>
    <header className={classes["main-header"]}>{props.header}</header>
    {props.mobileNav}
    <main className={classes["content"]}>{props.children}</main>
  </Fragment>
);
