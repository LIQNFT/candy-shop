import React from 'react';
export interface ProcessingProps {
  text: string;
}
const Processing = ({ text = '' }: ProcessingProps): JSX.Element => {
  return (
    <div className="candy-processing">
      <div className="candy-loading" />
      <div>{text}...</div>
    </div>
  );
};

export default Processing;
