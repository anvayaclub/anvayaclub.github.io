import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Calendar, FolderGit2, Users, Bell, Image, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { SearchResultItem } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.search(query.trim());
        if (res.success) {
          setResults(res.data);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4 text-gold-500" />;
      case 'project':
        return <FolderGit2 className="w-4 h-4 text-peacock-500" />;
      case 'team':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'gallery':
        return <Image className="w-4 h-4 text-emerald-500" />;
      case 'announcement':
        return <Bell className="w-4 h-4 text-amber-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-ivory-50 dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ivory-200 dark:border-plum-800">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search events, projects, team members, announcements..."
            className="flex-1 bg-transparent text-plum-950 dark:text-ivory-50 placeholder-gray-400 text-base outline-none font-sans"
          />
          {loading && <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-plum-800 transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {query.trim().length >= 2 && results.length === 0 && !loading && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No published records match "{query}".</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for "dance", "singing", "varnotsava", or team names.</p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="py-8 px-4 text-center text-xs text-gray-400">
              Type at least 2 characters to search across published events, projects, gallery, and team records.
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map(item => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item.url)}
                  className="w-full flex items-center justify-between gap-3 p-3 text-left rounded-xl hover:bg-gold-500/10 dark:hover:bg-plum-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-ivory-100 dark:bg-plum-800 border border-ivory-200 dark:border-plum-700 group-hover:border-gold-500/40">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-plum-950 dark:text-ivory-50 truncate group-hover:text-gold-600 dark:group-hover:text-gold-400">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gold-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-ivory-100/50 dark:bg-plum-950/60 border-t border-ivory-200 dark:border-plum-800 flex items-center justify-between text-[11px] text-gray-400">
          <span>Search published content only</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
