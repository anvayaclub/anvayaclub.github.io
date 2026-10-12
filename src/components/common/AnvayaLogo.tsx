import React, { useState } from 'react';

export interface AnvayaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'xl' | 'certificate' | 'custom';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
  linkToHome?: boolean;
}

export const AnvayaLogo: React.FC<AnvayaLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
  subtextClassName = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Sensible dimension variants preserving aspect ratio without distortion
  const sizeMap = {
    sm: 'h-8 max-w-[120px]',
    md: 'h-11 max-w-[150px]',
    lg: 'h-16 max-w-[200px]',
    hero: 'h-24 sm:h-28 md:h-36 max-w-[260px] sm:max-w-[300px] md:max-w-[360px]',
    xl: 'h-24 sm:h-28 max-w-[260px]',
    certificate: 'h-20 max-w-[180px]',
    custom: '',
  };

  const imageClass = size === 'custom' ? className : `${sizeMap[size]} object-contain ${className}`;

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {!imageError ? (
        <img
          src="/images/anvaya-logo.png"
          alt="Anvaya Logo"
          onError={() => setImageError(true)}
          className={`${imageClass} transition-opacity duration-200`}
        />
      ) : (
        /* Clean typographic placeholder in case image is missing */
        <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-gold-500/40 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-serif font-bold tracking-widest text-sm">
          <span>ANVAYA</span>
        </div>
      )}

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-serif font-bold tracking-wider leading-none text-plum-950 dark:text-ivory-50 ${textClassName || 'text-lg'}`}>
            ANVAYA
          </span>
          <span className={`text-[10px] uppercase tracking-widest text-plum-600 dark:text-ivory-300 font-sans font-medium mt-0.5 ${subtextClassName}`}>
            ISE · KIT Tiptur
          </span>
        </div>
      )}
    </div>
  );
};
