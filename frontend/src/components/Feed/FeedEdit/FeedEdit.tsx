import { FC, Fragment, useEffect, useRef, useState } from "react";
import { Backdrop } from "../../Backdrop/Backdrop";
import { Modal } from "../../Modal/Modal";
import { Input } from "../../Form/Input/Input";
import { FilePicker } from "../../Form/Input/FilePicker";
import { Image } from "../../Image/Image";
import { required, length, fileRequired } from "../../../util/validators";
import { generateBase64FromImage } from "../../../util/image";

/* ---------------- Types ---------------- */

type Validator<T = unknown> = (value: T) => boolean;

interface PostFormField<T> {
  value: T;
  valid: boolean;
  touched: boolean;
  validators: Validator<T>[];
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
  onFinishEdit: (post: {
    title: string;
    image: File | string;
    content: string;
  }) => void;
}

const POST_FORM: PostForm = {
  title: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
  image: {
    value: "",
    valid: false,
    touched: false,
    validators: [fileRequired],
  },
  content: {
    value: "",
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })],
  },
};

/* ---------------- Component ---------------- */

export const FeedEdit: FC<FeedEditProps> = ({
  editing,
  selectedPost,
  loading,
  onCancelEdit,
  onFinishEdit,
}) => {
  const [postForm, setPostForm] = useState<PostForm>(POST_FORM);
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const prevEditingRef = useRef<boolean>(editing);
  const prevSelectedPostRef = useRef<SelectedPost | null | undefined>(
    selectedPost
  );

  /* ---------- Sync edit state ---------- */
  useEffect(() => {
    const prevEditing = prevEditingRef.current;
    const prevSelectedPost = prevSelectedPostRef.current;

    if (
      editing &&
      prevEditing !== editing &&
      prevSelectedPost !== selectedPost &&
      selectedPost
    ) {
      setPostForm((prev) => ({
        title: { ...prev.title, value: selectedPost.title, valid: true },
        image: { ...prev.image, value: selectedPost.imagePath, valid: true },
        content: { ...prev.content, value: selectedPost.content, valid: true },
      }));
      setFormIsValid(true);
    }

    prevEditingRef.current = editing;
    prevSelectedPostRef.current = selectedPost;
  }, [editing, selectedPost]);

  /* ---------- Input handler ---------- */
  const postInputChangeHandler = (
    id: string,
    value: string,
    files?: FileList | null
  ): void => {
    const input = id as keyof PostForm;

    if (files && files.length > 0) {
      generateBase64FromImage(files[0])
        .then((b64: string) => setImagePreview(b64))
        .catch(() => setImagePreview(null));
    }

    setPostForm((prevState) => {
      let isValid = true;

      for (const validator of prevState[input].validators) {
        const val = files?.[0] ?? value;
        isValid = isValid && validator(val as never);
      }

      const updatedForm: PostForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          valid: isValid,
          value: files && files.length > 0 ? files[0] : value,
        },
      };

      let overallValid = true;
      (Object.keys(updatedForm) as (keyof PostForm)[]).forEach((key) => {
        overallValid = overallValid && updatedForm[key].valid;
      });

      setFormIsValid(overallValid);
      return updatedForm;
    });
  };

  /* ---------- Blur handler ---------- */
  const inputBlurHandler = (input: keyof PostForm): void => {
    setPostForm((prevState) => ({
      ...prevState,
      [input]: {
        ...prevState[input],
        touched: true,
      },
    }));
  };

  /* ---------- Cancel ---------- */
  const cancelPostChangeHandler = (): void => {
    setPostForm(POST_FORM);
    setFormIsValid(false);
    setImagePreview(null);
    onCancelEdit();
  };

  /* ---------- Accept ---------- */
  const acceptPostChangeHandler = (): void => {
    const post = {
      title: postForm.title.value,
      image: postForm.image.value,
      content: postForm.content.value,
    };

    onFinishEdit(post);
    setPostForm(POST_FORM);
    setFormIsValid(false);
    setImagePreview(null);
  };

  /* ---------- Render ---------- */
  return editing ? (
    <Fragment>
      <Backdrop onClick={cancelPostChangeHandler} />
      <Modal
        title="New Post"
        acceptEnabled={formIsValid}
        onCancelModal={cancelPostChangeHandler}
        onAcceptModal={acceptPostChangeHandler}
        isLoading={Boolean(loading)}
      >
        <form>
          <Input
            id="title"
            label="Title"
            control="input"
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("title")}
            valid={postForm.title.valid}
            touched={postForm.title.touched}
            value={postForm.title.value}
          />

          <FilePicker
            id="image"
            label="Image"
            onChange={postInputChangeHandler}
            onBlur={() => inputBlurHandler("image")}
            valid={postForm.image.valid}
            touched={postForm.image.touched}
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
            onBlur={() => inputBlurHandler("content")}
            valid={postForm.content.valid}
            touched={postForm.content.touched}
            value={postForm.content.value}
          />
        </form>
      </Modal>
    </Fragment>
  ) : null;
};
