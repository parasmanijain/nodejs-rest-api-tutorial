import React from 'react';

import './Toolbar.scss';

const toolbar = props => (
    <div className="toolbar">
        {props.children}
    </div>
);

export default toolbar;