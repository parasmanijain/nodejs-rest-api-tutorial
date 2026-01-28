import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Image } from "../../../components/Image/Image";
import classes from "./SinglePost.module.scss";

export interface SinglePostProps {
  userId: string | null;
  token: string | null;
}

interface PostData {
  title: string;
  creator: { name: string };
  imageUrl: string;
  createdAt: string;
  content: string;
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
        const graphqlQuery = {
          query: `
            query FetchSinglePost($postId: ID!) {
              post(id: $postId) {
                title
                creator { name }
                imageUrl
                createdAt
                content
              }
            }
          `,
          variables: { postId }
        };
        const res = await fetch("http://localhost:8080/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (token ?? "")
          },
          body: JSON.stringify(graphqlQuery)
        });
        const resData = await res.json();
        if (resData.errors) {
          throw new Error(resData.errors[0]?.message || "Failed to fetch post");
        }
        const data: PostData = resData.data.post;
        setTitle(data.title);
        setAuthor(data.creator.name);
        setImage(`http://localhost:8080/${data.imageUrl}`);
        setDate(new Date(data.createdAt).toLocaleDateString("en-US"));
        setContent(data.content);
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