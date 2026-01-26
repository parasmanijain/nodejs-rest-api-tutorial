import { FC, ReactNode } from "react";
import classes from "./Toolbar.module.scss";

export const Toolbar: FC<{ children: ReactNode }> = ({ children }) => (
    <div className={classes["toolbar"]}>{children}</div>
);
