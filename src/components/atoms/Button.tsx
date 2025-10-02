'use client';

import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  className?: string;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  className, 
  label, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = styles.button;
  const variantClasses = {
    primary: styles['button--primary'],
    secondary: styles['button--secondary'],
    danger: styles['button--danger'],
    warning: styles['button--warning']
  };
  const sizeClasses = {
    small: styles['button--small'],
    medium: styles['button--medium'],
    large: styles['button--large']
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type} 
      className={buttonClasses} 
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;