'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackText?: string;
}

export default function ProductImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackText,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(
        `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(
          fallbackText || alt
        )}`
      );
    }
  };

  // Uploaded product images are stored as base64 data URLs, which
  // next/image's optimizer doesn't handle — fall back to a plain <img>.
  if (imgSrc.startsWith('data:')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized={imgSrc.startsWith('http') && !imgSrc.includes('images.unsplash.com')}
    />
  );
}

