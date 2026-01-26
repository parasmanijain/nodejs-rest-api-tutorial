import { FC, FormEvent, useState } from "react";
import { required, length, email } from "../../util/validators";
import { Input } from "../../components/Form/Input/Input";
import { Button } from "../../components/Button/Button";
import { Auth } from "./Auth";

type Validator = (value: string) => boolean;

interface Field<T = string> {
  value: T;
  valid: boolean;
  touched: boolean;
  validators: Validator[];
}

interface SignupForm {
  email: Field<string>;
  password: Field<string>;
  name: Field<string>;
}

export interface SignupProps {
  onSignup: (
    e: FormEvent<HTMLFormElement>,
    payload: { signupForm: SignupForm; formIsValid: boolean },
  ) => void;
  loading?: boolean;
}

export const Signup: FC<SignupProps> = (props) => {
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
  const [formIsValid, setFormIsValid] = useState<boolean>(false);

  const inputChangeHandler = (input: keyof SignupForm, value: string) => {
    setSignupForm((prevState) => {
      let isValid = true;
      for (const validator of prevState[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm: SignupForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          valid: isValid,
          value,
        },
      };
      let overallValid = true;
      for (const inputName in updatedForm) {
        overallValid = overallValid && (updatedForm as any)[inputName].valid;
      }
      setFormIsValid(overallValid);
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
      <form onSubmit={(e) => props.onSignup(e, { signupForm, formIsValid })}>
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("email")}
          value={signupForm["email"].value}
          valid={signupForm["email"].valid}
          touched={signupForm["email"].touched}
        />
        <Input
          id="name"
          label="Your Name"
          type="text"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("name")}
          value={signupForm["name"].value}
          valid={signupForm["name"].valid}
          touched={signupForm["name"].touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("password")}
          value={signupForm["password"].value}
          valid={signupForm["password"].valid}
          touched={signupForm["password"].touched}
        />
        <Button design="raised" type="submit" loading={props.loading}>
          Signup
        </Button>
      </form>
    </Auth>
  );
};