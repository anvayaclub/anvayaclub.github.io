import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { GalleryMediaItem } from '../../types';

interface LightboxProps {
  media: GalleryMediaItem | null;
  allMedia: GalleryMediaItem[];
  onClose: () => void;
  onNavigate: (item: GalleryMediaItem) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ media, allMedia, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!media) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [media, allMedia]);

  if (!media) return null;

  const currentIndex = allMedia.findIndex(m => m.id === media.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(allMedia[currentIndex - 1]);
    } else {
      onNavigate(allMedia[allMedia.length - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allMedia.length - 1) {
      onNavigate(allMedia[currentIndex + 1]);
    } else {
      onNavigate(allMedia[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close media preview"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {allMedia.length > 1 && (
        <>
          <button
            onClick={e => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
            aria-label="Previous item"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
            aria-label="Next item"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Media content */}
      <div
        className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        {media.type === 'video' ? (
          <div className="w-full max-h-[70vh] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
            {media.url.includes('youtube.com') || media.url.includes('youtu.be') ? (
              <iframe
                src={media.url.replace('watch?v=', 'embed/')}
                title={media.title}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <video
                src={media.url}
                controls
                autoPlay
                className="w-full h-full max-h-[70vh] object-contain"
              />
            )}
          </div>
        ) : (
          <img
            src={media.url}
            alt={media.altText || media.title}
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl animate-fade-in select-none"
          />
        )}

        {/* Caption & Metadata */}
        <div className="mt-4 text-center max-w-2xl px-4">
          <h3 className="text-lg font-serif font-bold text-white tracking-wide">
            {media.title}
          </h3>
          {media.altText && media.altText !== media.title && (
            <p className="text-xs text-gray-300 mt-1">{media.altText}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-2">
            {media.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                {media.date}
              </span>
            )}
            {media.contributor && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gold-400" />
                {media.contributor}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
