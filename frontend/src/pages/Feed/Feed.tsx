import { FC, FormEvent, Fragment, useEffect, useState } from "react";
import { Post } from "../../components/Feed/Post/Post";
import { Button } from "../../components/Button/Button";
import { FeedEdit } from "../../components/Feed/FeedEdit/FeedEdit";
import { Input } from "../../components/Form/Input/Input";
import { Paginator } from "../../components/Paginator/Paginator";
import { Loader } from "../../components/Loader/Loader";
import {
  ErrorHandler,
  ErrorLike,
} from "../../components/ErrorHandler/ErrorHandler";
import classes from "./Feed.module.scss";

const API_URL = "http://localhost:8080";

export interface FeedProps {
  userId: string | null;
  token: string | null;
}

interface Creator {
  name: string;
}

export interface FeedPost {
  _id: string;
  title: string;
  content: string;
  creator: Creator;
  createdAt: string;
  imageUrl?: string;
}

export const Feed: FC<FeedProps> = ({ token }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState<FeedPost | null>(null);
  const [status, setStatus] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<ErrorLike | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/status`, {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        const data: { status: string } = await res.json();
        setStatus(data.status);
      } catch (err) {
        catchError(err);
      }
    };
    fetchStatus();
    loadPosts();
  }, [token]);

  const loadPosts = async (direction?: "next" | "previous") => {
    try {
      setPostsLoading(true);
      let page = postPage;
      if (direction === "next") page++;
      if (direction === "previous") page--;
      setPostPage(page);
      const res = await fetch(`${API_URL}/feed/posts?page=${page}`, {
        headers: { Authorization: "Bearer " + (token ?? "") },
      });
      if (res.status !== 200) {
        throw new Error("Failed to fetch posts.");
      }
      const data: { posts: FeedPost[]; totalItems: number } = await res.json();
      setPosts(data.posts);
      setTotalPosts(data.totalItems);
    } catch (err) {
      catchError(err);
    } finally {
      setPostsLoading(false);
    }
  };

  const statusUpdateHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/status`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + (token ?? ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Can't update status!");
      }
      await res.json();
    } catch (err) {
      catchError(err);
    }
  };

  const newPostHandler = () => setIsEditing(true);

  const startEditPostHandler = (postId: string) => {
    const loadedPost = posts.find((p) => p._id === postId);
    if (!loadedPost) return;
    setEditPost({ ...loadedPost });
    setIsEditing(true);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = async (postData: {
    title: string;
    content: string;
    image: File | string;
  }) => {
    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      formData.append("image", postData.image as Blob | string);
      let url = `${API_URL}/feed/post`;
      let method: "POST" | "PUT" = "POST";
      if (editPost) {
        url = `${API_URL}/feed/post/${editPost._id}`;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: "Bearer " + (token ?? ""),
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Creating or editing a post failed!");
      }
      const data: { post: FeedPost } = await res.json();
      setPosts((prev) => {
        const updated = [...prev];
        if (editPost) {
          const index = updated.findIndex((p) => p._id === editPost._id);
          if (index > -1) updated[index] = data.post;
        } else if (prev.length < 2) {
          updated.push(data.post);
        }
        return updated;
      });
      setIsEditing(false);
      setEditPost(null);
    } catch (err) {
      catchError(err);
    } finally {
      setEditLoading(false);
    }
  };

  const deletePostHandler = async (postId: string) => {
    try {
      setPostsLoading(true);
      const res = await fetch(`${API_URL}/feed/post/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + (token ?? ""),
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Deleting a post failed!");
      }
      await res.json();
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      catchError(err);
    } finally {
      setPostsLoading(false);
    }
  };

  const errorHandler = () => setError(null);

  const catchError = (err: unknown) => {
    setError({ message: err instanceof Error ? err.message : String(err) });
  };

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={
          editPost
            ? {
              title: editPost.title,
              imagePath: editPost.imageUrl ?? "",
              content: editPost.content,
            }
            : null
        }
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className={classes.feed__status}>
        <form onSubmit={statusUpdateHandler}>
          <Input
            id="status"
            type="text"
            placeholder="Your status"
            control="input"
            onChange={(_, value) => setStatus(value)}
            value={status}
            valid
            touched
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className={classes.feed__control}>
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className={classes.feed}>
        {postsLoading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Loader />
          </div>
        )}
        {!postsLoading && posts.length === 0 && (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        )}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts("previous")}
            onNext={() => loadPosts("next")}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map((post) => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString("en-US")}
                title={post.title}
                onStartEdit={() => startEditPostHandler(post._id)}
                onDelete={() => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
};
