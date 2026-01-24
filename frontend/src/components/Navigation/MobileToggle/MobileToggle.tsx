import './MobileToggle.scss';

interface MobileToggleProps {
  onOpen: () => void;
}

export const MobileToggle = (props: MobileToggleProps) => (
  <button className="mobile-toggle" onClick={props.onOpen}>
    <span className="mobile-toggle__bar" />
    <span className="mobile-toggle__bar" />
    <span className="mobile-toggle__bar" />
  </button>
);