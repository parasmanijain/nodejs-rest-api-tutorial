import { FC, FormEvent, Fragment, useEffect, useState } from 'react';
import openSocket from 'socket.io-client';
import { Post } from '../../components/Feed/Post/Post';
import { Button } from '../../components/Button/Button';
import { FeedEdit } from '../../components/Feed/FeedEdit/FeedEdit';
import { Input } from '../../components/Form/Input/Input';
import { Paginator } from '../../components/Paginator/Paginator';
import { Loader } from '../../components/Loader/Loader';
import { ErrorHandler, ErrorLike } from '../../components/ErrorHandler/ErrorHandler';
import classes from './Feed.module.scss';

const API_URL = 'http://localhost:8080';

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
  const [status, setStatus] = useState('');
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<ErrorLike | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/auth/status`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
        return res.json();
      })
      .then((resData: { status: string }) => {
        setStatus(resData.status);
      })
      .catch(catchError);

    loadPosts();
    openSocket('http://localhost:8080');
  }, [token]);

  const loadPosts = (direction?: 'next' | 'previous') => {
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }
    let page = postPage;
    if (direction === 'next') page++;
    if (direction === 'previous') page--;
    setPostPage(page);
    fetch(`${API_URL}/feed/posts?page=${page}`, {
      headers: {
        Authorization: 'Bearer ' + (token ?? '')
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch posts.');
        }
        return res.json();
      })
      .then((resData: { posts: FeedPost[]; totalItems: number }) => {
        setPosts(resData.posts);
        setTotalPosts(resData.totalItems);
        setPostsLoading(false);
      })
      .catch(catchError);
  };

  const statusUpdateHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch(`${API_URL}/auth/status`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + (token ?? ''),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .catch(catchError);
  };

  const newPostHandler = () => setIsEditing(true);

  const startEditPostHandler = (postId: string) => {
    const loadedPost = posts.find(p => p._id === postId);
    if (!loadedPost) return;
    setEditPost({ ...loadedPost });
    setIsEditing(true);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = (postData: {
    title: string;
    content: string;
    image: File | string;
  }) => {
    setEditLoading(true);
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image as Blob | string);
    let url = `${API_URL}/feed/post`;
    let method: 'POST' | 'PUT' = 'POST';
    if (editPost) {
      url = `${API_URL}/feed/post/${editPost._id}`;
      method = 'PUT';
    }

    fetch(url, {
      method,
      body: formData,
      headers: {
        Authorization: 'Bearer ' + (token ?? '')
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Creating or editing a post failed!');
        }
        return res.json();
      })
      .then((resData: { post: FeedPost }) => {
        setPosts(prev => {
          const updated = [...prev];
          if (editPost) {
            const index = updated.findIndex(p => p._id === editPost._id);
            if (index > -1) updated[index] = resData.post;
          } else if (prev.length < 2) {
            updated.push(resData.post);
          }
          return updated;
        });
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
      })
      .catch((err: unknown) => {
        setError({ message: err instanceof Error ? err.message : String(err) });
        setEditLoading(false);
        setIsEditing(false);
        setEditPost(null);
      });
  };

  const deletePostHandler = (postId: string) => {
    setPostsLoading(true);
    fetch(`${API_URL}/feed/post/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + (token ?? '')
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        return res.json();
      })
      .then(() => {
        setPosts(prev => prev.filter(p => p._id !== postId));
        setPostsLoading(false);
      })
      .catch(() => setPostsLoading(false));
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
              imagePath: editPost.imageUrl ?? '',
              content: editPost.content
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
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        )}
        {!postsLoading && posts.length === 0 && (
          <p style={{ textAlign: 'center' }}>No posts found.</p>
        )}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts('previous')}
            onNext={() => loadPosts('next')}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map(post => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString('en-US')}
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
