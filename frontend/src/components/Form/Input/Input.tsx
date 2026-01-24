import "./Input.scss";

interface InputProps {
  id: string;
  label?: string;
  control: 'input' | 'textarea';
  type?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  rows?: string;
  valid: boolean;
  touched: boolean;
  onChange: (id: string, value: string, files?: FileList | null) => void;
  onBlur: () => void;
}

export const Input = (props: InputProps) => (
  <div className="input">
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    {props.control === "input" && (
      <input
        className={[
          !props.valid ? "invalid" : "valid",
          props.touched ? "touched" : "untouched",
        ].join(" ")}
        type={props.type}
        id={props.id}
        required={props.required}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) =>
          props.onChange(props.id, e.target.value, e.target.files)
        }
        onBlur={props.onBlur}
      />
    )}
    {props.control === "textarea" && (
      <textarea
        className={[
          !props.valid ? "invalid" : "valid",
          props.touched ? "touched" : "untouched",
        ].join(" ")}
        id={props.id}
        rows={parseInt(props.rows || "3")}
        required={props.required}
        value={props.value}
        onChange={(e) => props.onChange(props.id, e.target.value)}
        onBlur={props.onBlur}
      />
    )}
  </div>
);