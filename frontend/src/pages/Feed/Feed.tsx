import { FC, FormEvent, Fragment, useEffect, useState } from 'react';
import { Post } from '../../components/Feed/Post/Post';
import { Button } from '../../components/Button/Button';
import { FeedEdit } from '../../components/Feed/FeedEdit/FeedEdit';
import { Input } from '../../components/Form/Input/Input';
import { Paginator } from '../../components/Paginator/Paginator';
import { Loader } from '../../components/Loader/Loader';
import { ErrorHandler, ErrorLike } from '../../components/ErrorHandler/ErrorHandler';
import classes from './Feed.module.scss';

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

export const Feed: FC<FeedProps> = ({ token, userId }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [editPost, setEditPost] = useState<FeedPost | null>(null);
  const [status, setStatus] = useState<string>('');
  const [postPage, setPostPage] = useState<number>(1);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorLike | null>(null);

  useEffect(() => {
    fetch('URL')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPosts = (direction?: 'next' | 'previous') => {
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }
    let page = postPage;
    if (direction === 'next') {
      page++;
      setPostPage(page);
    }
    if (direction === 'previous') {
      page--;
      setPostPage(page);
    }
    fetch('http://localhost:8080/feed/posts?page=' + page, {
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
    fetch('URL')
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(catchError);
  };

  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = (postId: string) => {
    const loadedPost = { ...posts.find(p => p._id === postId)! };
    setIsEditing(true);
    setEditPost(loadedPost);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = (postData: { title: string; content: string; image: File | string }) => {
    setEditLoading(true);
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image as Blob | string);
    let url = 'http://localhost:8080/feed/post';
    let method: 'POST' | 'PUT' = 'POST';
    if (editPost) {
      url = 'http://localhost:8080/feed/post/' + editPost._id;
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
      .then((resData: {
        post: {
          _id: string;
          title: string;
          content: string;
          creator: Creator;
          createdAt: string;
        };
      }) => {
        const post: FeedPost = {
          _id: resData.post._id,
          title: resData.post.title,
          content: resData.post.content,
          creator: resData.post.creator,
          createdAt: resData.post.createdAt
        };
        setPosts(prev => {
          let updatedPosts = [...prev];
          if (editPost) {
            const postIndex = prev.findIndex(p => p._id === editPost._id);
            if (postIndex > -1) {
              updatedPosts[postIndex] = post;
            }
          } else if (prev.length < 2) {
            updatedPosts = prev.concat(post);
          }
          return updatedPosts;
        });
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
      })
      .catch((err: unknown) => {
        console.log(err);
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
        setError({ message: err instanceof Error ? err.message : String(err) });
      });
  };

  const statusInputChangeHandler = (_input: string, value: string, _files?: FileList | null) => {
    setStatus(value);
  };

  const deletePostHandler = (postId: string) => {
    setPostsLoading(true);
    fetch('http://localhost:8080/feed/post/' + postId, {
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
      .then(resData => {
        console.log(resData);
        setPosts(prev => prev.filter(p => p._id !== postId));
        setPostsLoading(false);
      })
      .catch((err: unknown) => {
        console.log(err);
        setPostsLoading(false);
      });
  };

  const errorHandler = () => {
    setError(null);
  };

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
            ? { title: editPost.title, imagePath: editPost.imageUrl || '', content: editPost.content }
            : null
        }
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className={classes["feed__status"]}>
        <form onSubmit={statusUpdateHandler}>
          <Input
            id="status"
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
            valid={true}
            touched={true}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className={classes["feed__control"]}>
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className={classes["feed"]}>
        {postsLoading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: 'center' }}>No posts found.</p>
        ) : null}
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