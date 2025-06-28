import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  title, 
  children, 
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

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
        <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>
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
