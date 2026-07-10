import React from 'react';
import './GlassCard.css';

export function GlassCard({ className = '', children, variant = 'base', hoverEffect = true, ...props }) {
  return (
    <div className={`glass-card glass-card-${variant} ${hoverEffect ? 'glass-card-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}
