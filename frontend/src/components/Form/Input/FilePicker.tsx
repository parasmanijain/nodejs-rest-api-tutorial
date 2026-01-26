import React from 'react';
import './Input.scss';

export interface FilePickerProps {
  id: string;
  label: string;
  valid: boolean;
  touched: boolean;
  onChange: (id: string, value: string, files?: FileList | null) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const FilePicker: React.FC<FilePickerProps> = (props) => (
  <div className="input">
    <label htmlFor={props.id}>{props.label}</label>
    <input
      className={[
        !props.valid ? 'invalid' : 'valid',
        props.touched ? 'touched' : 'untouched'
      ].join(' ')}
      type="file"
      id={props.id}
      onChange={(e) => props.onChange(props.id, e.target.value, e.target.files)}
      onBlur={props.onBlur}
    />
  </div>
);

export default FilePicker;