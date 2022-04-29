import React from 'react';
export interface ProcessingProps {
  text?: string;
}
export const Processing = ({ text = '' }: ProcessingProps): JSX.Element => {
  return (
    <div className="candy-processing">
      <div className="candy-loading" />
      {text ? <div>{text}...</div> : null}
    </div>
  );
};
