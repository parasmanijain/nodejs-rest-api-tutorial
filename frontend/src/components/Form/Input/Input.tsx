import { FC, FocusEventHandler } from "react";
import classes from "./Input.module.scss";

export type ControlType = "input" | "textarea";

export interface InputProps {
  id: string;
  label?: string;
  control: ControlType;
  type?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  rows?: number;
  valid: boolean;
  touched: boolean;
  onChange: (id: string, value: string, files?: FileList | null) => void;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export const Input: FC<InputProps> = (props) => {
  const fieldClassName = [
    props.valid ? classes.valid : classes.invalid,
    props.touched ? classes.touched : classes.untouched,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes["input"]}>
      {props.label && <label htmlFor={props.id}>{props.label}</label>}
      {props.control === "input" && (
        <input
          className={fieldClassName}
          type={props.type}
          id={props.id}
          required={props.required}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) =>
            props.onChange(props.id, e.target.value, e.target.files)
          }
          onBlur={props.onBlur as FocusEventHandler<HTMLInputElement>}
        />
      )}
      {props.control === "textarea" && (
        <textarea
          className={
            classes[
            [
              !props.valid ? "invalid" : "valid",
              props.touched ? "touched" : "untouched",
            ].join(" ")
            ]
          }
          id={props.id}
          rows={props.rows}
          required={props.required}
          value={props.value}
          onChange={(e) => props.onChange(props.id, e.target.value)}
          onBlur={props.onBlur as FocusEventHandler<HTMLTextAreaElement>}
        />
      )}
    </div>
  );
};
