import { FC, FormEvent, useState } from "react";
import type { SignupForm } from "../../types/form";
import { required, length, email } from "../../util/validators";
import { Input } from "../../components/Form/Input/Input";
import { Button } from "../../components/Button/Button";
import { Auth } from "./Auth";

export interface SignupProps {
  onSignup: (
    e: FormEvent<HTMLFormElement>,
    payload: { signupForm: SignupForm; formIsValid: boolean },
  ) => void;
  loading?: boolean;
}

export const Signup: FC<SignupProps> = ({ onSignup, loading }) => {
  const [signupForm, setSignupForm] = useState<SignupForm>({
    email: {
      value: "",
      valid: false,
      touched: false,
      validators: [required, email],
    },
    password: {
      value: "",
      valid: false,
      touched: false,
      validators: [required, length({ min: 5 })],
    },
    name: {
      value: "",
      valid: false,
      touched: false,
      validators: [required],
    },
  });

  const [formIsValid, setFormIsValid] = useState(false);

  const inputChangeHandler = (
    id: string,
    value: string,
    _files?: FileList | null,
  ) => {
    const input = id as keyof SignupForm;

    setSignupForm((prevState) => {
      let isValid = true;
      for (const validator of prevState[input].validators) {
        isValid = isValid && validator(value);
      }

      const updatedForm: SignupForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          value,
          valid: isValid,
        },
      };

      setFormIsValid(
        Object.values(updatedForm).every((field) => field.valid),
      );

      return updatedForm;
    });
  };

  const inputBlurHandler = (input: keyof SignupForm) => {
    setSignupForm((prevState) => ({
      ...prevState,
      [input]: {
        ...prevState[input],
        touched: true,
      },
    }));
  };

  return (
    <Auth>
      <form onSubmit={(e) => onSignup(e, { signupForm, formIsValid })}>
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("email")}
          value={signupForm.email.value}
          valid={signupForm.email.valid}
          touched={signupForm.email.touched}
        />
        <Input
          id="name"
          label="Your Name"
          type="text"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("name")}
          value={signupForm.name.value}
          valid={signupForm.name.valid}
          touched={signupForm.name.touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("password")}
          value={signupForm.password.value}
          valid={signupForm.password.valid}
          touched={signupForm.password.touched}
        />
        <Button design="raised" type="submit" loading={loading}>
          Signup
        </Button>
      </form>
    </Auth>
  );
};
