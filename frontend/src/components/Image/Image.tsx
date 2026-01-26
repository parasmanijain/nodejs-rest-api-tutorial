import { FC } from "react";
import classes from "./Image.module.scss";

export interface ImageProps {
  imageUrl: string;
  contain?: boolean;
  left?: boolean;
}

export const Image: FC<ImageProps> = ({ imageUrl, contain, left }) => (
  <div
    className={classes["image"]}
    style={{
      backgroundImage: `url('${imageUrl}')`,
      backgroundSize: contain ? "contain" : "cover",
      backgroundPosition: left ? "left" : "center",
    }}
  />
);
