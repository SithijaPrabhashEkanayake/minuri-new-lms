import React from 'react';
import './CapsuleToggle.css';

export function CapsuleToggle({ id, label, checked, onChange, className = '', ...props }) {
  return (
    <div className={`capsule-toggle-container ${className}`}>
      {label && <span className="capsule-toggle-label">{label}</span>}
      <label htmlFor={id} className="capsule-toggle">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <span className="capsule-toggle-track">
          <span className="capsule-toggle-knob"></span>
        </span>
      </label>
    </div>
  );
}
