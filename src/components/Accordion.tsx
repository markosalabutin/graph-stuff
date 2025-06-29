import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  isExpanded?: boolean; // Controlled mode
  className?: string;
  onToggle?: (isExpanded: boolean) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  className = '',
  onToggle,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isExpanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = useCallback(() => {
    const newExpanded = !isExpanded;

    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded);
    }

    onToggle?.(newExpanded);
  }, [isExpanded, controlledExpanded, onToggle]);

  return (
    <div className={`${styles.accordion} ${className}`}>
      <button
        className={styles.accordionHeader}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls="accordion-content"
        type="button"
      >
        <span>{title}</span>
        <span
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div id="accordion-content" className={styles.accordionContent}>
          {children}
        </div>
      )}
    </div>
  );
};
