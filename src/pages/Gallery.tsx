import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Image as ImageIcon,
  Video,
  Filter,
  Play,
  Calendar,
  User,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { GalleryAlbum, GalleryMediaItem } from '../types';
import { Lightbox } from '../components/common/Lightbox';

export const Gallery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAlbum = searchParams.get('album') || 'all';

  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [mediaList, setMediaList] = useState<GalleryMediaItem[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(initialAlbum);
  const [selectedType, setSelectedType] = useState<'all' | 'photo' | 'video'>('all');
  const [loading, setLoading] = useState(true);

  // Lightbox state
  const [activeMedia, setActiveMedia] = useState<GalleryMediaItem | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await api.gallery.getAlbums();
        if (res.success) {
          setAlbums(res.data);
        }
      } catch (err) {
        console.error('Failed to load gallery albums:', err);
      }
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const res = await api.gallery.getMedia({
          albumId: selectedAlbumId !== 'all' ? selectedAlbumId : undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
        });
        if (res.success) {
          setMediaList(res.data);
        }
      } catch (err) {
        console.error('Failed to load gallery media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [selectedAlbumId, selectedType]);

  const handleAlbumSelect = (id: string) => {
    setSelectedAlbumId(id);
    if (id === 'all') {
      searchParams.delete('album');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ album: id });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Visual & Media Archives</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
          Photo & Video Gallery
        </h1>
        <p className="text-base text-plum-700 dark:text-ivory-200 leading-relaxed font-sans">
          Documenting authentic programmes, stage productions, traditional days, and student celebrations conducted at Kalpataru Institute of Technology, Tiptur.
        </p>
      </section>

      {/* 2. Filters & Albums Strip */}
      <section className="space-y-4">
        {/* Album Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleAlbumSelect('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedAlbumId === 'all'
                ? 'bg-gold-500 text-white shadow-md'
                : 'bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 text-plum-900 dark:text-ivory-100 hover:border-gold-500'
            }`}
          >
            All Programmes
          </button>

          {albums.map(alb => (
            <button
              key={alb.id}
              onClick={() => handleAlbumSelect(alb.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedAlbumId === alb.id
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 text-plum-900 dark:text-ivory-100 hover:border-gold-500'
              }`}
            >
              <span>{alb.title}</span>
              {alb.mediaCount !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-mono">
                  {alb.mediaCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Media Type Filter (Photos / Videos / All) */}
        <div className="flex items-center justify-between border-t border-ivory-200 dark:border-plum-800 pt-4">
          <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Media:</span>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'photo', 'video'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors flex items-center gap-1.5 ${
                  selectedType === type
                    ? 'bg-plum-950 text-white dark:bg-ivory-100 dark:text-plum-950 font-bold'
                    : 'bg-ivory-100 dark:bg-plum-900 text-plum-700 dark:text-ivory-300 hover:text-gold-500'
                }`}
              >
                {type === 'photo' && <ImageIcon className="w-3.5 h-3.5" />}
                {type === 'video' && <Video className="w-3.5 h-3.5" />}
                <span>{type === 'all' ? 'All Formats' : `${type}s`}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Media Grid */}
      <section>
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading media items...</p>
          </div>
        ) : mediaList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaList.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveMedia(item)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Media Image / Thumbnail */}
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-black/5">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.altText || item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Video Play Badge */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                      <div className="p-3 rounded-full bg-gold-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold uppercase">
                    {item.type}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1.5">
                  <h3 className="text-sm font-serif font-bold text-plum-950 dark:text-ivory-50 line-clamp-1 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                    {item.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold-500" />
                        <span>{item.date}</span>
                      </span>
                    )}

                    {item.contributor && (
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <User className="w-3 h-3 text-gold-500 flex-shrink-0" />
                        <span className="truncate">{item.contributor}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white/50 dark:bg-plum-900/40 border border-ivory-200 dark:border-plum-800 max-w-md mx-auto">
            <FolderOpen className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">
              No Media Items Found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Select another album or switch media format filters.
            </p>
          </div>
        )}
      </section>

      {/* 4. Lightbox Modal */}
      <Lightbox
        media={activeMedia}
        allMedia={mediaList}
        onClose={() => setActiveMedia(null)}
        onNavigate={item => setActiveMedia(item)}
      />
    </div>
  );
};
