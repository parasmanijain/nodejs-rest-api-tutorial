import { FC } from "react";
import { Button } from "../../Button/Button";
import classes from "./Post.module.scss";

export interface PostProps {
  id: string;
  author: string;
  date: string;
  title: string;
  onStartEdit: () => void;
  onDelete: () => void;
}

export const Post: FC<PostProps> = ({ id, author, date, title, onDelete, onStartEdit }) => (
  <article className={classes["post"]}>
    <header className={classes["post__header"]}>
      <h3 className={classes["post__meta"]}>
        Posted by {author} on {date}
      </h3>
      <h1 className={classes["post__title"]}>{title}</h1>
    </header>
    <div className={classes["post__actions"]}>
      <Button mode="flat" link={id}>
        View
      </Button>
      <Button mode="flat" onClick={onStartEdit}>
        Edit
      </Button>
      <Button mode="flat" design="danger" onClick={onDelete}>
        Delete
      </Button>
    </div>
  </article>
);
