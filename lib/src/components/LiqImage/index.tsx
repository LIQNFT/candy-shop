import React, { useState, useEffect, useRef } from 'react';
import imgDefault from '../../assets/img-default.png';

interface LiqImageProps {
  src: string | undefined | null;
  alt: string | undefined;
  fit?: 'cover' | 'contain';
  style?: { [key: string]: string | number } | undefined;
}

export const LiqImage: React.FC<LiqImageProps> = ({
  src,
  alt,
  fit = 'cover',
  style = {},
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [width, setWidth] = useState<number>();

  const loaderDivStyles = loaded
    ? { display: 'none' }
    : {
        height: 0,
        paddingBottom: '100%',
        width: '100%',
        backgroundColor: '#E5E5E5',
      };

  const baseStyle = {
    position: 'relative',
    height: width,
    overflow: 'hidden',
  } as React.CSSProperties;

  const combinedStyle = { ...baseStyle, ...style };

  const onElementResize = () =>
    setWidth(ref.current ? ref.current.offsetWidth : 0);

  useEffect(() => {
    onElementResize();
    window.addEventListener('resize', onElementResize);
    return () => window.removeEventListener('resize', onElementResize);
  }, []);

  return (
    <div style={combinedStyle} ref={ref}>
      <div style={loaderDivStyles}></div>
      {src ? (
        <img
          className="candy-liq-image"
          alt={alt}
          src={src}
          width="100%"
          height="100%"
          style={
            loaded ? { display: 'block', objectFit: fit } : { display: 'none' }
          }
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <img
          className="candy-liq-image"
          src={imgDefault}
          alt="NFT image"
          width="100%"
          style={
            loaded ? { display: 'block', objectFit: fit } : { display: 'none' }
          }
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
};
