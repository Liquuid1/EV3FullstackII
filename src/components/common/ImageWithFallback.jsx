import React, { useState, useEffect } from 'react';
import placeholder from '../../assets/placeholder.jpg';

export const ImageWithFallback = ({ src, alt = '', className, style, ...rest }) => {
  const [currentSrc, setCurrentSrc] = useState(src || placeholder);

  useEffect(() => {
    setCurrentSrc(src || placeholder);
  }, [src]);

  const handleError = () => {
    if (currentSrc !== placeholder) setCurrentSrc(placeholder);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...rest}
    />
  );
};