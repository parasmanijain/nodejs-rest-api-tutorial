import { ReactNode } from 'react';
import './Toolbar.scss';

interface ToolbarProps {
    children: ReactNode;
}

export const Toolbar = (props: ToolbarProps) => (
    <div className="toolbar">
        {props.children}
    </div>
);