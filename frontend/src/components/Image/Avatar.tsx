import { Image } from './Image';
import './Avatar.scss';

interface AvatarProps {
  image: string;
  size: number;
}

export const Avatar = (props: AvatarProps) => (
  <div
    className="avatar"
    style={{ width: props.size + 'rem', height: props.size + 'rem' }}
  >
    <Image imageUrl={props.image} />
  </div>
);