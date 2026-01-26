import { FC, Fragment, useEffect, useRef, useState } from 'react';
import { Backdrop } from '../../Backdrop/Backdrop';
import { Modal } from '../../Modal/Modal';
import { Input } from '../../Form/Input/Input';
import { FilePicker } from '../../Form/Input/FilePicker';
import { Image } from '../../Image/Image';
import { required, length } from '../../../util/validators';
import { generateBase64FromImage } from '../../../util/image';

type Validator = (value: unknown) => boolean;

interface PostFormField<T> {
  value: T;
  valid: boolean;
  touched: boolean;
  validators: Validator[];
}

interface PostForm {
  title: PostFormField<string>;
  image: PostFormField<File | string>;
  content: PostFormField<string>;
}

export interface SelectedPost {
  title: string;
  imagePath: string;
  content: string;
}

export interface FeedEditProps {
  editing: boolean;
  selectedPost?: SelectedPost | null;
  loading?: boolean;
  onCancelEdit: () => void;
  onFinishEdit: (post: { title: string; image: File | string; content: string }) => void;
}

const POST_FORM: PostForm = {
  title: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })]
  },
  image: {
    value: '',
    valid: false,
    touched: false,
    validators: [required]
  },
  content: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })]
  }
};

export const FeedEdit: FC<FeedEditProps> = (props) => {
  const [postForm, setPostForm] = useState<PostForm>(POST_FORM);
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const prevEditingRef = useRef<boolean>(props.editing);
  const prevSelectedPostRef = useRef<SelectedPost | null | undefined>(props.selectedPost);

  useEffect(() => {
    const prevEditing = prevEditingRef.current;
    const prevSelectedPost = prevSelectedPostRef.current;

    if (
      props.editing &&
      prevEditing !== props.editing &&
      prevSelectedPost !== props.selectedPost &&
      props.selectedPost
    ) {
      setPostForm((prev) => ({
        title: { ...prev.title, value: props.selectedPost!.title, valid: true },
        image: { ...prev.image, value: props.selectedPost!.imagePath, valid: true },
        content: { ...prev.content, value: props.selectedPost!.content, valid: true }
      }));
      setFormIsValid(true);
    }

    prevEditingRef.current = props.editing;
    prevSelectedPostRef.current = props.selectedPost;
  }, [props.editing, props.selectedPost]);

  const postInputChangeHandler = (
    input: keyof PostForm,
    value: string,
    files?: FileList | null
  ) => {
    if (files && files.length > 0) {
      generateBase64FromImage(files[0])
        .then((b64: string) => {
          setImagePreview(b64);
        })
        .catch(() => {
          setImagePreview(null);
        });
    }

    setPostForm((prevState) => {
      let isValid = true;
      for (const validator of prevState[input].validators) {
        isValid = isValid && Boolean(validator(files && files.length > 0 ? files[0] : value));
      }
      const updatedForm: PostForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          valid: isValid,
          value: files && files.length > 0 ? files[0] : value
        }
      };

      let overallValid = true;
      for (const inputName in updatedForm) {
        if (Object.prototype.hasOwnProperty.call(updatedForm, inputName)) {
          overallValid = overallValid && (updatedForm as any)[inputName].valid;
        }
      }

      setFormIsValid(overallValid);
      return updatedForm;
    });
  };

  const inputBlurHandler = (input: keyof PostForm) => {
    setPostForm((prevState) => ({
      ...prevState,
      [input]: {
        ...prevState[input],
        touched: true
      }
    }));
  };

  const cancelPostChangeHandler = () => {
    setPostForm(POST_FORM);
    setFormIsValid(false);
    props.onCancelEdit();
  };

  const acceptPostChangeHandler = () => {
    const post = {
      title: postForm.title.value,
      image: postForm.image.value,
      content: postForm.content.value
    };
    props.onFinishEdit(post);
    setPostForm(POST_FORM);
    setFormIsValid(false);
    setImagePreview(null);
  };

  return props.editing ? (
    <Fragment>
      <Backdrop onClick={cancelPostChangeHandler} />
      <Modal
        title="New Post"
        acceptEnabled={formIsValid}
        onCancelModal={cancelPostChangeHandler}
        onAcceptModal={acceptPostChangeHandler}
        isLoading={Boolean(props.loading)}
      >
        <form>
          <Input
            id="title"
            label="Title"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler('title')}
            valid={postForm['title'].valid}
            touched={postForm['title'].touched}
            value={postForm['title'].value}
          />
          <FilePicker
            id="image"
            label="Image"
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler('image')}
            valid={postForm['image'].valid}
            touched={postForm['image'].touched}
          />
          <div className="new-post__preview-image">
            {!imagePreview && <p>Please choose an image.</p>}
            {imagePreview && <Image imageUrl={imagePreview} contain left />}
          </div>
          <Input
            id="content"
            label="Content"
            control="textarea"
            rows={5}
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler('content')}
            valid={postForm['content'].valid}
            touched={postForm['content'].touched}
            value={postForm['content'].value}
          />
        </form>
      </Modal>
    </Fragment>
  ) : null;
};