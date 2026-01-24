import './Input.scss';

interface FilePickerProps {
  id: string;
  label: string;
  control: string;
  valid: boolean;
  touched: boolean;
  onChange: (id: string, value: string, files?: FileList | null) => void;
  onBlur: () => void;
}

export const FilePicker = (props: FilePickerProps) => (
  <div className="input">
    <label htmlFor={props.id}>{props.label}</label>
    <input
      className={[
        !props.valid ? 'invalid' : 'valid',
        props.touched ? 'touched' : 'untouched'
      ].join(' ')}
      type="file"
      id={props.id}
      onChange={e => props.onChange(props.id, e.target.value, e.target.files)}
      onBlur={props.onBlur}
    />
  </div>
);