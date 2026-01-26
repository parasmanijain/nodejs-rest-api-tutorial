import { FC, ReactNode } from "react";
import classes from "./Auth.module.scss";

export interface AuthProps {
    children?: ReactNode;
}

export const Auth: FC<AuthProps> = (props) => (
    <section className={classes["auth-form"]}>{props.children}</section>
);