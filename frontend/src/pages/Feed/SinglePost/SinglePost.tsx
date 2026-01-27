import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Image } from "../../../components/Image/Image";
import classes from "./SinglePost.module.scss";

export interface SinglePostProps {
  userId: string | null;
  token: string | null;
}

interface PostResponse {
  post: {
    title: string;
    creator: { name: string };
    imageUrl: string;
    createdAt: string;
    content: string;
  };
}

export const SinglePost: FC<SinglePostProps> = ({ token }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const { postId } = useParams<{ postId: string }>();
  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8080/feed/post/${postId}`, {
          headers: {
            Authorization: "Bearer " + (token ?? "")
          }
        });
        if (res.status !== 200) {
          throw new Error("Failed to fetch status");
        }
        const data: PostResponse = await res.json();
        setTitle(data.post.title);
        setAuthor(data.post.creator.name);
        setImage(`http://localhost:8080/${data.post.imageUrl}`);
        setDate(
          new Date(data.post.createdAt).toLocaleDateString("en-US")
        );
        setContent(data.post.content);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
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
