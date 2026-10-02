import React, { useState } from "react";

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 6.5 10 6.5a15.3 15.3 0 0 1-3.4 4.1M6.6 6.6C4 8.3 2 12 2 12s3.6 6.5 10 6.5c1.6 0 3-0.3 4.2-0.9" />
    <path d="M9.9 9.9a2.8 2.8 0 0 0 3.9 3.9" />
  </svg>
);

/**
 * A password field with a built-in eye icon that toggles between
 * hidden and visible text, without changing how the parent uses it -
 * same props (name, value, onChange, placeholder, etc.) as a plain
 * <input>.
 */
const PasswordInput = ({
  name,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  className,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field-wrap">
      <input
        className={className || "field-input"}
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;
