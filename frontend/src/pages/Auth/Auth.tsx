import { ReactNode } from 'react';
import './Auth.scss';

interface AuthProps {
    children: ReactNode;
}

export const Auth = (props: AuthProps) => <section className="auth-form">{props.children}</section>;