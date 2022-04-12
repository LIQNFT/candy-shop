import styled from '@emotion/styled';
import React, { useState, useEffect, useRef } from 'react';
import imgDefault from '../../assets/img-default.png';

interface LiqImageProps {
  src: string | undefined | null;
  alt: string | undefined;
  style?: { [key: string]: string | number } | undefined;
}

export const LiqImage: React.FC<LiqImageProps> = ({ src, alt, style = {} }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [width, setWidth] = useState<number>();

  let loaderDivStyles = loaded
    ? { display: 'none' }
    : {
        height: 0,
        paddingBottom: '100%',
        width: '100%',
        backgroundColor: '#E5E5E5',
      };

  let baseStyle = {
    position: 'relative',
    borderTopLeftRadius: '14px',
    borderTopRightRadius: '14px',
    height: width,
    overflow: 'hidden',
  };
  let combinedStyle = { ...baseStyle, ...style };

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
        <Image
          alt={alt}
          src={src}
          width="100%"
          height="100%"
          style={loaded ? { display: 'block' } : { display: 'none' }}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <Image
          src={imgDefault}
          alt="NFT image"
          width="100%"
          style={loaded ? { display: 'block' } : { display: 'none' }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
};

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
