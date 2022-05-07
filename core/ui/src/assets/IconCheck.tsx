import React from 'react';

interface IconCheckProps {
fill?: string;
}

export const  IconCheck: React.FC<IconCheckProps> = ({fill =  '#7522F5'})=> {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
            d="M5.8289 7.55313L2.39718 4.40728L0.217285 6.40559L6.03548 11.7391L14.826 2.07263L12.4549 0.260864L5.8289 7.55313Z" 
            fill={fill}
        />
    </svg>

  );
}
