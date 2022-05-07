import React from 'react';
import { LOADING_SKELETON_COUNT } from 'constant/Orders';

import { Skeleton } from 'components/Skeleton';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="candy-container-list">
      {Array(LOADING_SKELETON_COUNT)
        .fill(0)
        .map((_, key) => (
          <div key={key}>
            <Skeleton />
          </div>
        ))}
    </div>
  );
};
