import { FC, FocusEventHandler } from "react";
import classes from "./Input.module.scss";

export interface FilePickerProps {
  id: string;
  label: string;
  valid: boolean;
  touched: boolean;
  onChange: (id: string, value: string, files?: FileList | null) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}

export const FilePicker: FC<FilePickerProps> = (props) => {
  const inputClassName = [
    props.valid ? classes.valid : classes.invalid,
    props.touched ? classes.touched : classes.untouched,
  ].join(" ");
  return (
    <div className={classes["input"]}>
      <label htmlFor={props.id}>{props.label}</label>
      <input
        className={inputClassName}
        type="file"
        id={props.id}
        onChange={(e) =>
          props.onChange(props.id, e.target.value, e.target.files)
        }
        onBlur={props.onBlur}
      />
    </div>
  );
};
