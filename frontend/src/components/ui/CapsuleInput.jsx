import React, { useState } from 'react';
import './CapsuleInput.css';

export function CapsuleInput({ label, id, className = '', type = 'text', ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    if (props.onBlur) props.onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (props.onChange) props.onChange(e);
  };

  const isActive = isFocused || hasValue || props.value;

  return (
    <div className={`capsule-input-container ${className}`}>
      <div className={`capsule-input-wrapper ${isActive ? 'active' : ''}`}>
        <label htmlFor={id} className="capsule-label">{label}</label>
        <input
          id={id}
          type={type}
          className="capsule-input"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
      </div>
    </div>
  );
}
