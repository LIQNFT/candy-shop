import React from 'react';

import './style.less';

export interface TooltipProps {
  children: any;
  inner: JSX.Element | string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, inner, className }) => {
  return (
    <div className={`candy-tooltip ${className || ''}`}>
      <div className="candy-tooltip-label">{children}</div>
      <div className="candy-tooltip-inner">{inner}</div>
    </div>
  );
};
