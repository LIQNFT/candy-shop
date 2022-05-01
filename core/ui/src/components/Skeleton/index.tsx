import React from 'react';
import './index.less';

export const Skeleton = () => {
  return (
    <div className="candy-skeleton">
      <div className="candy-skeleton-container">
        <div className="candy-skeleton-animation" />
        <div className="candy-skeleton-item" style={{ width: '50%', marginBottom: '24px' }} />
        <div className="candy-skeleton-item" style={{ marginBottom: '12px' }} />
        <div className="candy-skeleton-item" style={{ marginBottom: '12px' }} />
        <div className="candy-skeleton-item" style={{ width: '80%' }} />
      </div>
    </div>
  );
};
