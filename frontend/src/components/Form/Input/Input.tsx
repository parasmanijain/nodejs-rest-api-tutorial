import React from 'react';
import './Input.scss';

export type ControlType = 'input' | 'textarea';

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
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

const Input: React.FC<InputProps> = (props) => (
  <div className="input">
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    {props.control === 'input' && (
      <input
        className={[
          !props.valid ? 'invalid' : 'valid',
          props.touched ? 'touched' : 'untouched'
        ].join(' ')}
        type={props.type}
        id={props.id}
        required={props.required}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(props.id, e.target.value, e.target.files)}
        onBlur={props.onBlur as React.FocusEventHandler<HTMLInputElement>}
      />
    )}
    {props.control === 'textarea' && (
      <textarea
        className={[
          !props.valid ? 'invalid' : 'valid',
          props.touched ? 'touched' : 'untouched'
        ].join(' ')}
        id={props.id}
        rows={props.rows}
        required={props.required}
        value={props.value}
        onChange={(e) => props.onChange(props.id, e.target.value)}
        onBlur={props.onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
      />
    )}
  </div>
);

export default Input;