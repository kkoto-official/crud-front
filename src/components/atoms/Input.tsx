'use client';

import React from 'react';
import styles from './Input.module.css';

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  error,
  className
}) => {
  const baseClasses = styles.input;
  const errorClasses = error ? styles['input--error'] : '';
  const disabledClasses = disabled ? styles['input--disabled'] : '';

  const inputClasses = [
    baseClasses,
    errorClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles['input-container']}>
      {label && (
        <label className={styles['input-label']}>
          {label}
          {required && <span className={styles['input-required']}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
      {error && <span className={styles['input-error']}>{error}</span>}
    </div>
  );
};

export default Input; 