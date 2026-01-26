import React, { Fragment } from 'react';
import './Layout.scss';

export interface LayoutProps {
  header?: React.ReactNode;
  mobileNav?: React.ReactNode;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = (props) => (
  <Fragment>
    <header className="main-header">{props.header}</header>
    {props.mobileNav}
    <main className="content">{props.children}</main>
  </Fragment>
);

export default Layout;