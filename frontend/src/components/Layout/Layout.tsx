import "./Layout.scss";

export const Layout = (props) => (
  <>
    <header className="main-header">{props.header}</header>
    {props.mobileNav}
    <main className="content">{props.children}</main>
  </>
);
