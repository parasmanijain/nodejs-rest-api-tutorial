import { FC } from "react";
import { Image } from "./Image";
import classes from "./Avatar.module.scss";

export interface AvatarProps {
  image: string;
  size: number; // in rem
}

export const Avatar: FC<AvatarProps> = ({ size, image }) => (
  <div
    className={classes["avatar"]}
    style={{ width: size + "rem", height: size + "rem" }}
  >
    <Image imageUrl={image} />
  </div>
);
