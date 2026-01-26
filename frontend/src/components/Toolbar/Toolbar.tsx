import classes from "./Toolbar.module.scss";

export const Toolbar = (props) => (
    <div className={classes["toolbar"]}>{props.children}</div>
);
