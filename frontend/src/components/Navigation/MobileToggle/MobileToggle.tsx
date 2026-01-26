import React from 'react';
import './MobileToggle.scss';

export interface MobileToggleProps {
  onOpen: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = (props) => (
  <button className="mobile-toggle" onClick={props.onOpen}>
    <span className="mobile-toggle__bar" />
    <span className="mobile-toggle__bar" />
    <span className="mobile-toggle__bar" />
  </button>
);

export default MobileToggle;