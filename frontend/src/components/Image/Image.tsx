import { FC } from "react";
import classes from "./Image.module.scss";

export interface ImageProps {
  imageUrl: string;
  contain?: boolean;
  left?: boolean;
}

export const Image: FC<ImageProps> = (props) => (
  <div
    className={classes["image"]}
    style={{
      backgroundImage: `url('${props.imageUrl}')`,
      backgroundSize: props.contain ? "contain" : "cover",
      backgroundPosition: props.left ? "left" : "center",
    }}
  />
);
