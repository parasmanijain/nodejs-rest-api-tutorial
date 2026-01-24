import { Fragment, useCallback, useEffect, useState, FormEvent } from 'react';
import { Post } from '../../components/Feed/Post/Post';
import { Button } from '../../components/Button/Button';
import { FeedEdit } from '../../components/Feed/FeedEdit/FeedEdit';
import { Input } from '../../components/Form/Input/Input';
import { Paginator } from '../../components/Paginator/Paginator';
import { Loader } from '../../components/Loader/Loader';
import { ErrorHandler } from '../../components/ErrorHandler/ErrorHandler';
import './Feed.scss';

interface PostData {
  _id: string;
  title: string;
  content: string;
  creator: {
    name: string;
  };
  createdAt: string;
  imageUrl?: string;
}

interface PostFormData {
  title: string;
  image: string | File;
  content: string;
}

export const Feed = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [editPost, setEditPost] = useState<PostData | null>(null);
  const [status, setStatus] = useState<string>('');
  const [postPage, setPostPage] = useState<number>(1);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const catchError = (err: Error) => setError(err);
  const errorHandler = () => setError(null);

  const loadPosts = useCallback(
    (direction?: 'next' | 'previous') => {
      if (direction) {
        setPostsLoading(true);
        setPosts([]);
      }
      let page = postPage;
      if (direction === 'next') {
        page = postPage + 1;
        setPostPage(page);
      }
      if (direction === 'previous') {
        page = postPage - 1;
        setPostPage(page);
      }

      // NOTE: Replace 'URL' with real endpoint. Using same placeholder as original code.
      fetch('URL')
        .then((res) => {
          if (res.status !== 200) {
            throw new Error('Failed to fetch posts.');
          }
          return res.json();
        })
        .then((resData) => {
          setPosts(resData.posts);
          setTotalPosts(resData.totalItems);
          setPostsLoading(false);
        })
        .catch(catchError);
    },
    [postPage],
  );

  useEffect(() => {
    // Load user status
    fetch('URL')
      .then((res) => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch user status.');
        }
        return res.json();
      })
      .then((resData) => {
        setStatus(resData.status);
      })
      .catch(catchError);

    // Load posts initially
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const statusUpdateHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch('URL')
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then((resData) => {
        // keep behavior same as original (log only)
        console.log(resData);
      })
      .catch(catchError);
  };

  const newPostHandler = () => setIsEditing(true);

  const startEditPostHandler = (postId: string) => {
    const loadedPost = { ...posts.find((p) => p._id === postId)! };
    setIsEditing(true);
    setEditPost(loadedPost);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = (postData: PostFormData) => {
    setEditLoading(true);
    let url = 'URL';
    if (editPost) {
      url = 'URL';
    }

    fetch(url)
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Creating or editing a post failed!');
        }
        return res.json();
      })
      .then((resData) => {
        const post: PostData = {
          _id: resData.post._id,
          title: resData.post.title,
          content: resData.post.content,
          creator: resData.post.creator,
          createdAt: resData.post.createdAt,
        };
        setPosts((prev) => {
          let updatedPosts = [...prev];
          if (editPost) {
            const postIndex = prev.findIndex((p) => p._id === editPost._id);
            updatedPosts[postIndex] = post;
          } else if (prev.length < 2) {
            updatedPosts = prev.concat(post);
          }
          return updatedPosts;
        });
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
        setError(err);
      });
  };

  const statusInputChangeHandler = (_input: string, value: string) => setStatus(value);

  const deletePostHandler = (postId: string) => {
    setPostsLoading(true);
    fetch('URL')
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        setPostsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setPostsLoading(false);
      });
  };

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
            id="status"
            valid={true}
            touched={false}
            onBlur={() => { }}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className="feed">
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
            onPrevious={loadPosts.bind(null, 'previous')}
            onNext={loadPosts.bind(null, 'next')}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map((post) => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString('en-US')}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={startEditPostHandler.bind(null, post._id)}
                onDelete={deletePostHandler.bind(null, post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
};