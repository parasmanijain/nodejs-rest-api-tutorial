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

export const Input: FC<InputProps> = ({
  valid,
  touched,
  id,
  control,
  type,
  required,
  value,
  placeholder,
  onChange,
  onBlur,
  label, rows
}) => {
  const fieldClassName = [
    valid ? classes.valid : classes.invalid,
    touched ? classes.touched : classes.untouched,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes["input"]}>
      {label && <label htmlFor={id}>{label}</label>}
      {control === "input" && (
        <input
          className={fieldClassName}
          type={type}
          id={id}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(id, e.target.value, e.target.files)}
          onBlur={onBlur as FocusEventHandler<HTMLInputElement>}
        />
      )}
      {control === "textarea" && (
        <textarea
          className={fieldClassName}
          id={id}
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          onBlur={onBlur as FocusEventHandler<HTMLTextAreaElement>}
        />
      )}
    </div>
  );
};
