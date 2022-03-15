import React from 'react';

const Processing = ({ text = '' }: { text: string }) => {
  return (
    <div className="candy-processing">
      <div className="candy-loading" />
      <div>{text}...</div>
    </div>
  );
};

export default Processing;
