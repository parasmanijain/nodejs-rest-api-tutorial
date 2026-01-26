import { FC, ReactNode } from "react";
import classes from "./Auth.module.scss";

export interface AuthProps {
    children?: ReactNode;
}

export const Auth: FC<AuthProps> = ({ children }) => (
    <section className={classes["auth-form"]}>{children}</section>
);