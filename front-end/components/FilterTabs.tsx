import React from 'react';
import { FilterTabsProps, FilterStatus } from '../types';
import styles from '../styles/FilterTabs.module.css';

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'applied', label: 'Applied' },
    { key: 'interviews', label: 'Interviews' },
    { key: 'offers', label: 'Offers' }
  ];

  return (
    <div className={styles.filterContainer}>
      {filters.map((filter) => (
        <button
          key={filter.key}
          className={`${styles.filterTab} ${
            activeFilter === filter.key ? styles.active : ''
          }`}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
