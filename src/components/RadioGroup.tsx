import React from 'react';
import styles from './RadioGroup.module.css';

export interface RadioOption<T = string> {
  value: T;
  label: string;
  color?: string;
}

interface RadioGroupProps<T = string> {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  ariaLabel?: string;
  className?: string;
  variant?: 'default' | 'full-width';
}

export const RadioGroup = <T extends string>({
  options,
  value,
  onChange,
  name,
  ariaLabel,
  className = '',
  variant = 'default'
}: RadioGroupProps<T>) => {
  const containerClass = variant === 'full-width' 
    ? `${styles.radioGroup} ${styles.fullWidth}` 
    : styles.radioGroup;

  return (
    <div 
      className={`${containerClass} ${className}`} 
      role="radiogroup" 
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <label key={option.value} className={styles.radioOption}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className={styles.radioInput}
            aria-label={`${option.label}`}
          />
          <span
            className={`${styles.radioLabel} ${value === option.value ? styles.active : ''}`}
            style={
              option.color
                ? {
                    '--option-color': option.color,
                  } as React.CSSProperties
                : undefined
            }
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};
