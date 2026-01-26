import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Image } from "../../../components/Image/Image";
import classes from "./SinglePost.module.scss";

export interface SinglePostProps {
  userId: string | null;
  token: string | null;
}

export const SinglePost: FC<SinglePostProps> = ({ token, userId }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const { postId } = useParams();
  useEffect(() => {
    fetch("http://localhost:8080/feed/post/" + postId, {
      headers: {
        Authorization: "Bearer " + (token ?? "")
      }
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch status");
        }
        return res.json();
      })
      .then((resData) => {
        setTitle(resData.post.title);
        setAuthor(resData.post.creator.name);
        setImage("http://localhost:8080/" + resData.post.imageUrl);
        setDate(new Date(resData.post.createdAt).toLocaleDateString("en-US"));
        setContent(resData.post.content);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [postId, token]);

  return (
    <section className={classes["single-post"]}>
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className={classes["single-post__image"]}>
        <Image contain imageUrl={image} />
      </div>
      <p>{content}</p>
    </section>
  );
};