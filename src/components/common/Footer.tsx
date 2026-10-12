import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { AnvayaLogo } from './AnvayaLogo';
import { InstagramIcon, YoutubeIcon, LinkedinIcon, GithubIcon } from './SocialIcons';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { success, error } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Please enter a valid student email address.');
      return;
    }

    setSubscribing(true);
    try {
      const res = await api.communication.subscribeNewsletter(email.trim());
      if (res.success) {
        setSubscribed(true);
        success(res.message);
        setEmail('');
      }
    } catch (err: any) {
      error(err.message || 'Subscription failed. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-ivory-100 dark:bg-plum-950 border-t border-ivory-300/80 dark:border-plum-850 text-plum-900 dark:text-ivory-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Association */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block" aria-label="Anvaya Home">
              <AnvayaLogo size="md" showText={true} />
            </Link>
            <p className="text-sm text-plum-700 dark:text-ivory-300 leading-relaxed max-w-sm">
              The official cultural committee and student community of the Department of Information Science & Engineering at Kalpataru Institute of Technology, Tiptur. Celebrating artistic expression, cultural heritage, and student leadership.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/kit.anvaya.ise?cplk=d3pjdGYzbDU3M3Nr"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-ivory-200/80 dark:bg-plum-900/80 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                aria-label="Anvaya on Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@anvaya_kit"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-ivory-200/80 dark:bg-plum-900/80 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                aria-label="Anvaya on YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/anvaya-kit"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-ivory-200/80 dark:bg-plum-900/80 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                aria-label="Anvaya on LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/anvayaclub"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-ivory-200/80 dark:bg-plum-900/80 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                aria-label="Anvaya on GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-4 font-sans">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  About Anvaya
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Meet the Team
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Events & Calendar
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Projects Showcase
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Photo & Video Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Portals */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-4 font-sans">
              Portals
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/certificate" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                  Certificate Portal
                </Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-peacock-500"></span>
                  Join Anvaya (Recruitment)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                  Contact Committee
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 dark:text-gray-500 hover:text-plum-900 dark:hover:text-ivory-200 transition-colors text-xs pt-1 inline-block">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-4 font-sans">
              Cultural Bulletin
            </h3>
            <p className="text-xs text-plum-700 dark:text-ivory-300 mb-3 leading-relaxed">
              Subscribe for upcoming audition alerts, fest registrations, and committee announcements.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Subscribed to bulletin updates!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter student email"
                    required
                    className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-gold-500 text-white hover:bg-gold-600 transition-colors disabled:opacity-50"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-ivory-200 dark:border-plum-850 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-gold-500 flex-shrink-0" />
                <span>KIT Campus, Tiptur - 572201</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-gold-500 flex-shrink-0" />
                <span>clubanvaya@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 pt-6 border-t border-ivory-300/60 dark:border-plum-850/80 flex flex-col sm:flex-row items-center justify-between text-xs text-plum-600 dark:text-ivory-400 gap-3">
          <p>
            © {new Date().getFullYear()} Anvaya Cultural Committee · Department of Information Science & Engineering · Kalpataru Institute of Technology.
          </p>
          <p className="text-[11px] text-gray-400">
            Affiliated to Visvesvaraya Technological University (VTU)
          </p>
        </div>
      </div>
    </footer>
  );
};
