import React, { useState, useEffect, useRef } from 'react';
import imgDefault from '../../assets/img-default.png';

interface LiqImageProps {
  src: string | undefined;
  alt: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}

export const LiqImage: React.FC<LiqImageProps> = ({ src, alt, style = {} }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [width, setWidth] = useState<number>();

  let loaderDivStyles = loaded
    ? { display: 'none' }
    : { height: 0, paddingBottom: '100%', width: '100%' };

  let baseStyle = {
    backgroundColor: '#E5E5E5',
    borderTopLeftRadius: '14px',
    borderTopRightRadius: '14px',
    height: width,
    overflow: 'hidden',
  };
  let combinedStyle = { ...baseStyle, ...style };

  useEffect(() => {
    setWidth(
      ref.current ? ((ref.current as unknown) as HTMLElement).offsetWidth : 0
    );
  }, []);

  window.addEventListener('resize', () => {
    setWidth(
      ref.current ? ((ref.current as unknown) as HTMLElement).offsetWidth : 0
    );
  });

  return (
    <div style={combinedStyle} ref={ref}>
      <div style={loaderDivStyles}></div>
      {src ? (
        <img
          alt={alt}
          src={src}
          width="100%"
          height="100%"
          style={loaded ? { display: 'block' } : { display: 'none' }}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <img
          src={imgDefault}
          alt="No metadata found"
          width="100%"
          style={loaded ? { display: 'block' } : { display: 'none' }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
};
