import React from 'react';
import { ApplicationCardProps } from '../types';
import styles from '../styles/ApplicationCard.module.css';

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return '#10b981'; // Green
      case 'interview':
        return '#f59e0b'; // Orange
      case 'offer':
        return '#3b82f6'; // Blue
      case 'rejected':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'interview':
        return 'Interview';
      case 'offer':
        return 'Offer';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.logoPlaceholder}></div>
        <div className={styles.jobInfo}>
          <h3 className={styles.jobTitle}>{application.jobTitle}</h3>
          <p className={styles.datePosted}>{application.datePosted}</p>
        </div>
      </div>
      <div className={styles.cardMiddle}>
        <div className={styles.tags}>
          <span className={styles.tag}>{application.company}</span>
          <span className={styles.tag}>{application.location}</span>
          <span className={styles.tag}>{application.payPerHour}</span>
        </div>
      </div>
      <div className={styles.cardRight}>
        <div className={styles.statusContainer}>
          <div 
            className={styles.statusIndicator}
            style={{ backgroundColor: getStatusColor(application.status) }}
          ></div>
          <span className={styles.statusLabel}>{getStatusLabel(application.status)}</span>
        </div>
      </div>
    </div>
  );
}
