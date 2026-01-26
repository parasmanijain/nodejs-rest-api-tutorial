import { FC } from "react";
import { Image } from "./Image";
import classes from "./Avatar.module.scss";

export interface AvatarProps {
  image: string;
  size: number; // in rem
}

export const Avatar: FC<AvatarProps> = (props) => (
  <div
    className={classes["avatar"]}
    style={{ width: props.size + "rem", height: props.size + "rem" }}
  >
    <Image imageUrl={props.image} />
  </div>
);
