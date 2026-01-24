import './Image.scss';

interface ImageProps {
  imageUrl: string;
  contain?: boolean;
  left?: boolean;
}

export const Image = (props: ImageProps) => (
  <div
    className="image"
    style={{
      backgroundImage: `url('${props.imageUrl}')`,
      backgroundSize: props.contain ? 'contain' : 'cover',
      backgroundPosition: props.left ? 'left' : 'center'
    }}
  />
);