import React from 'react';
import Image from './Image';
import './Avatar.scss';

export interface AvatarProps {
  image: string;
  size: number; // in rem
}

const Avatar: React.FC<AvatarProps> = (props) => (
  <div
    className="avatar"
    style={{ width: props.size + 'rem', height: props.size + 'rem' }}
  >
    <Image imageUrl={props.image} />
  </div>
);

export default Avatar;