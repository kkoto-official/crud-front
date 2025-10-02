'use client';

import React from 'react';
import styles from './FormField.module.css';

export interface FormFieldProps {
  fieldName: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  fieldName,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles['form-field']}>
      <label className={styles['form-field-label']}>
        {label}
        {required && <span className={styles['form-field-required']}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${styles['form-field-input']} ${error ? styles['form-field-error'] : ''}`}
      />
      {error && (
        <span className={styles['form-field-error-message']}>{error}</span>
      )}
    </div>
  );
};

export default FormField; 