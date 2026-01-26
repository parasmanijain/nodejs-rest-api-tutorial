import React from 'react';
import './Image.scss';

export interface ImageProps {
  imageUrl: string;
  contain?: boolean;
  left?: boolean;
}

const Image: React.FC<ImageProps> = (props) => (
  <div
    className="image"
    style={{
      backgroundImage: `url('${props.imageUrl}')`,
      backgroundSize: props.contain ? 'contain' : 'cover',
      backgroundPosition: props.left ? 'left' : 'center'
    }}
  />
);

export default Image;