import { ReactNode } from "react";
import "./Layout.scss";

interface LayoutProps {
  header: ReactNode;
  mobileNav: ReactNode;
  children?: ReactNode;
}

export const Layout = (props: LayoutProps) => (
  <>
    <header className="main-header">{props.header}</header>
    {props.mobileNav}
    <main className="content">{props.children}</main>
  </>
);