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

export const FilePicker: FC<FilePickerProps> = () => {
  const inputClassName = [
    valid ? classes.valid : classes.invalid,
    touched ? classes.touched : classes.untouched,
  ].join(" ");
  return (
    <div className={classes["input"]}>
      <label htmlFor={id}>{label}</label>
      <input
        className={inputClassName}
        type="file"
        id={id}
        onChange={(e) =>
          onChange(id, e.target.value, e.target.files)
        }
        onBlur={onBlur}
      />
    </div>
  );
};
