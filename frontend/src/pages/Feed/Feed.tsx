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
        const graphqlQuery = {
          query: `
            {
              user {
                status
              }
            }
          `,
        };
        const res = await fetch(`${API_URL}/graphql`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(graphqlQuery),
        });
        const resData = await res.json();
        if (resData.errors) {
          throw new Error("Failed to fetch user status.");
        }
        setStatus(resData.data.user.status);
      } catch (err) {
        catchError(err);
      }
    };
    fetchStatus();
    loadPosts();
    // eslint-disable-next-line
  }, [token]);

  const loadPosts = async (direction?: "next" | "previous") => {
    try {
      setPostsLoading(true);
      let page = postPage;
      if (direction === "next") page++;
      if (direction === "previous") page--;
      setPostPage(page);
      const graphqlQuery = {
        query: `
          query FetchPosts($page: Int) {
            posts(page: $page) {
              posts {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
              totalPosts
            }
          }
        `,
        variables: { page },
      };
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (token ?? ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      });
      const resData = await res.json();
      if (resData.errors) {
        throw new Error("Failed to fetch posts.");
      }
      setPosts(resData.data.posts.posts);
      setTotalPosts(resData.data.posts.totalPosts);
    } catch (err) {
      catchError(err);
    } finally {
      setPostsLoading(false);
    }
  };

  const statusUpdateHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const graphqlQuery = {
        query: `
          mutation UpdateUserStatus($userStatus: String!) {
            updateStatus(status: $userStatus) {
              status
            }
          }
        `,
        variables: { userStatus: status },
      };
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (token ?? ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      });
      const resData = await res.json();
      if (resData.errors) {
        throw new Error("Can't update status!");
      }
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

      // Step 1: Upload image if it's a File
      let imageUrl = typeof postData.image === "string" ? postData.image : "";
      if (postData.image instanceof File) {
        const formData = new FormData();
        formData.append("image", postData.image);
        if (editPost && editPost.imageUrl) {
          formData.append("oldPath", editPost.imageUrl);
        }
        const imageRes = await fetch(`${API_URL}/post-image`, {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + (token ?? ""),
          },
          body: formData,
        });
        const imageData = await imageRes.json();
        imageUrl = imageData.filePath || "";
      }

      // Step 2: Create or update post via GraphQL
      let graphqlQuery;
      if (editPost) {
        graphqlQuery = {
          query: `
            mutation UpdateExistingPost($postId: ID!, $title: String!, $content: String!, $imageUrl: String!) {
              updatePost(id: $postId, postInput: {title: $title, content: $content, imageUrl: $imageUrl}) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
            }
          `,
          variables: {
            postId: editPost._id,
            title: postData.title,
            content: postData.content,
            imageUrl,
          },
        };
      } else {
        graphqlQuery = {
          query: `
            mutation CreateNewPost($title: String!, $content: String!, $imageUrl: String!) {
              createPost(postInput: {title: $title, content: $content, imageUrl: $imageUrl}) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
            }
          `,
          variables: {
            title: postData.title,
            content: postData.content,
            imageUrl,
          },
        };
      }
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (token ?? ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      });
      const resData = await res.json();
      if (resData.errors) {
        throw new Error(
          resData.errors[0]?.message || "Creating or editing a post failed!",
        );
      }
      const post = editPost ? resData.data.updatePost : resData.data.createPost;
      setPosts((prev) => {
        const updated = [...prev];
        if (editPost) {
          const index = updated.findIndex((p) => p._id === editPost._id);
          if (index > -1) updated[index] = post;
        } else {
          if (prev.length >= 2) updated.pop();
          updated.unshift(post);
        }
        return updated;
      });
      if (!editPost) {
        setTotalPosts((prev) => prev + 1);
      }
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
      const graphqlQuery = {
        query: `
          mutation {
            deletePost(id: "${postId}")
          }
        `,
      };
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (token ?? ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      });
      const resData = await res.json();
      if (resData.errors) {
        throw new Error("Deleting a post failed!");
      }
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setTotalPosts((prev) => (prev > 0 ? prev - 1 : 0));
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