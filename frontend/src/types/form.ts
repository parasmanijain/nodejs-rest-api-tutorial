export type Validator<T = string> = (value: T) => boolean;

export interface Field<T = string> {
  value: T;
  valid: boolean;
  touched: boolean;
  validators: Validator<T>[];
}

export interface LoginForm {
  email: Field<string>;
  password: Field<string>;
}

export interface SignupForm extends LoginForm {
  name: Field<string>;
}
