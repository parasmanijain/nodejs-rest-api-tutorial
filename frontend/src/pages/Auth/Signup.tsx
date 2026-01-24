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

interface SignupFormData {
  email: FormField;
  password: FormField;
  name: FormField;
}

interface SignupData {
  signupForm: SignupFormData;
}

interface SignupProps {
  loading: boolean;
  onSignup: (event: FormEvent<HTMLFormElement>, authData: SignupData) => void;
}

export const Signup = (props: SignupProps) => {
  const [signupForm, setSignupForm] = useState<SignupFormData>({
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
    name: {
      value: '',
      valid: false,
      touched: false,
      validators: [required],
    },
  });
  const [formIsValid, setFormIsValid] = useState<boolean>(false);

  const inputChangeHandler = (input: keyof SignupFormData, value: string) => {
    setSignupForm((prevState) => {
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
        overallValid = overallValid && updatedForm[inputName as keyof SignupFormData].valid;
      }
      setFormIsValid(overallValid);
      return updatedForm;
    });
  };

  const inputBlurHandler = (input: keyof SignupFormData) => {
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
      <form onSubmit={(e) => props.onSignup(e, { signupForm })}>
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler.bind(null, 'email')}
          value={signupForm['email'].value}
          valid={signupForm['email'].valid}
          touched={signupForm['email'].touched}
        />
        <Input
          id="name"
          label="Your Name"
          type="text"
          control="input"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler.bind(null, 'name')}
          value={signupForm['name'].value}
          valid={signupForm['name'].valid}
          touched={signupForm['name'].touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler.bind(null, 'password')}
          value={signupForm['password'].value}
          valid={signupForm['password'].valid}
          touched={signupForm['password'].touched}
        />
        <Button design="raised" type="submit" loading={props.loading} disabled={!formIsValid}>
          Signup
        </Button>
      </form>
    </Auth>
  );
};