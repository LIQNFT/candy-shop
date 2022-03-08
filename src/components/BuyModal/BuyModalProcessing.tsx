import React, { useEffect } from 'react';

const BuyModalProcessing = ({ onChangeStep }: { onChangeStep: any }) => {
  // TEMP - To change step
  useEffect(() => {
    setTimeout(() => onChangeStep(2), 2000);
  }, []);

  return (
    <div className="buy-modal-processing">
      <div className="buy-modal-loading" />
      <div>Processing purchase...</div>
    </div>
  );
};

export default BuyModalProcessing;
