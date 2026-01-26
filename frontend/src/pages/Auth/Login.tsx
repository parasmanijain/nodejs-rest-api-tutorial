import { FC, FormEvent, useState } from "react";
import { required, length, email } from "../../util/validators";
import { Input } from "../../components/Form/Input/Input";
import { Button } from "../../components/Button/Button";
import { Auth } from "./Auth";

type Validator = (value: string) => boolean;

interface Field {
  value: string;
  valid: boolean;
  touched: boolean;
  validators: Validator[];
}

interface LoginForm {
  email: Field;
  password: Field;
}

export interface LoginProps {
  onLogin: (
    e: FormEvent<HTMLFormElement>,
    authData: { email: string; password: string },
  ) => void;
  loading?: boolean;
}

export const Login: FC<LoginProps> = (props) => {
  const [loginForm, setLoginForm] = useState<LoginForm>({
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
  });
  const [, setFormIsValid] = useState<boolean>(false);

  const inputChangeHandler = (input: keyof LoginForm, value: string) => {
    setLoginForm((prevState) => {
      let isValid = true;
      for (const validator of prevState[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm: LoginForm = {
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

  const inputBlurHandler = (input: keyof LoginForm) => {
    setLoginForm((prevState) => ({
      ...prevState,
      [input]: {
        ...prevState[input],
        touched: true,
      },
    }));
  };

  return (
    <Auth>
      <form
        onSubmit={(e) =>
          props.onLogin(e, {
            email: loginForm.email.value,
            password: loginForm.password.value,
          })
        }
      >
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("email")}
          value={loginForm["email"].value}
          valid={loginForm["email"].valid}
          touched={loginForm["email"].touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler("password")}
          value={loginForm["password"].value}
          valid={loginForm["password"].valid}
          touched={loginForm["password"].touched}
        />
        <Button design="raised" type="submit" loading={props.loading}>
          Login
        </Button>
      </form>
    </Auth>
  );
};