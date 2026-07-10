import React from 'react';
export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
