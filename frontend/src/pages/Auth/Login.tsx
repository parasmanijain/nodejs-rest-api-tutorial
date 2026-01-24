import { FormEvent, useState } from 'react';
import { Input } from '../../components/Form/Input/Input';
import { Button } from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import { Auth } from './Auth';

interface FormField {
  value: string;
  valid: boolean;
  touched: boolean;
  validators: Array<(value: string) => boolean>;
}

interface LoginFormData {
  email: FormField;
  password: FormField;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginProps {
  loading: boolean;
  onLogin: (event: FormEvent<HTMLFormElement>, authData: LoginData) => void;
}

export const Login = (props: LoginProps) => {
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, email],
    },
    password: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, length({ min: 5 })],
    },
  });
  const [formIsValid, setFormIsValid] = useState<boolean>(false);

  const inputChangeHandler = (input: keyof LoginFormData, value: string) => {
    setLoginForm((prevState) => {
      let isValid = true;
      for (const validator of prevState[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState,
        [input]: {
          ...prevState[input],
          valid: isValid,
          value: value,
        },
      };
      let overallValid = true;
      for (const inputName in updatedForm) {
        overallValid = overallValid && updatedForm[inputName as keyof LoginFormData].valid;
      }
      setFormIsValid(overallValid);
      return updatedForm;
    });
  };

  const inputBlurHandler = (input: keyof LoginFormData) => {
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
          onBlur={inputBlurHandler.bind(null, 'email')}
          value={loginForm['email'].value}
          valid={loginForm['email'].valid}
          touched={loginForm['email'].touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler.bind(null, 'password')}
          value={loginForm['password'].value}
          valid={loginForm['password'].valid}
          touched={loginForm['password'].touched}
        />
        <Button design="raised" type="submit" loading={props.loading} disabled={!formIsValid}>
          Login
        </Button>
      </form>
    </Auth>
  );
};