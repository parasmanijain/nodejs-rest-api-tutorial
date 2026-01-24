import { Fragment, useEffect, useState } from 'react';
import { Backdrop } from '../../Backdrop/Backdrop';
import { Modal } from '../../Modal/Modal';
import { Input } from '../../Form/Input/Input';
import { FilePicker } from '../../Form/Input/FilePicker';
import { Image } from '../../Image/Image';
import { required, length } from '../../../util/validators';
import { generateBase64FromImage } from '../../../util/image';

interface FormField {
  value: string | File;
  valid: boolean;
  touched: boolean;
  validators: Array<(value: string) => boolean>;
}

interface PostFormData {
  title: FormField;
  image: FormField;
  content: FormField;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  imagePath: string;
}

interface PostData {
  title: string;
  image: string | File;
  content: string;
}

interface FeedEditProps {
  editing: boolean;
  selectedPost?: Post | null;
  loading: boolean;
  onCancelEdit: () => void;
  onFinishEdit: (post: PostData) => void;
}

const POST_FORM: PostFormData = {
  title: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
  image: {
    value: '',
    valid: false,
    touched: false,
    validators: [required],
  },
  content: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
};

export const FeedEdit = (props: FeedEditProps) => {
  const [postForm, setPostForm] = useState<PostFormData>(POST_FORM);
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (props.editing && props.selectedPost) {
      setPostForm((prev) => ({
        title: {
          ...prev.title,
          value: props.selectedPost!.title,
          valid: true,
        },
        image: {
          ...prev.image,
          value: props.selectedPost!.imagePath,
          valid: true,
        },
        content: {
          ...prev.content,
          value: props.selectedPost!.content,
          valid: true,
        },
      }));
      setFormIsValid(true);
    }
  }, [props.editing, props.selectedPost]);

  const postInputChangeHandler = (input: keyof PostFormData, value: string, files?: FileList | null) => {
    if (files) {
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
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          valid: isValid,
          value: files ? files[0] : value,
        },
      };
      let newFormIsValid = true;
      for (const inputName in updatedForm) {
        newFormIsValid = newFormIsValid && updatedForm[inputName as keyof PostFormData].valid;
      }
      setFormIsValid(newFormIsValid);
      return updatedForm;
    });
  };

  const inputBlurHandler = (input: keyof PostFormData) => {
    setPostForm((prevState) => ({
      ...prevState,
      [input]: {
        ...prevState[input],
        touched: true,
      },
    }));
  };

  const cancelPostChangeHandler = () => {
    setPostForm(POST_FORM);
    setFormIsValid(false);
    setImagePreview(null);
    props.onCancelEdit();
  };

  const acceptPostChangeHandler = () => {
    const post: PostData = {
      title: postForm.title.value as string,
      image: postForm.image.value,
      content: postForm.content.value as string,
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
        isLoading={props.loading}
      >
        <form>
          <Input
            id="title"
            label="Title"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={inputBlurHandler.bind(null, 'title')}
            valid={postForm['title'].valid}
            touched={postForm['title'].touched}
            value={postForm['title'].value as string}
          />
          <FilePicker
            id="image"
            label="Image"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={inputBlurHandler.bind(null, 'image')}
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
            rows="5"
            onChange={postInputChangeHandler}
            onBlur={inputBlurHandler.bind(null, 'content')}
            valid={postForm['content'].valid}
            touched={postForm['content'].touched}
            value={postForm['content'].value as string}
          />
        </form>
      </Modal>
    </Fragment>
  ) : null;
};