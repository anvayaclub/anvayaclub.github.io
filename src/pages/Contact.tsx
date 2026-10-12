import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
} from 'lucide-react';
import { InstagramIcon, YoutubeIcon, LinkedinIcon, GithubIcon } from '../components/common/SocialIcons';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      error('Please complete all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.communication.submitContact({
        name,
        email,
        subject,
        message,
      });

      if (res.success) {
        setSubmitted(true);
        success(res.message);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
          <Mail className="w-3.5 h-3.5" />
          <span>Connect with the Committee</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
          Get in Touch
        </h1>
        <p className="text-base text-plum-700 dark:text-ivory-200 leading-relaxed font-sans">
          Have an inquiry regarding event sponsorships, troupe collaborations, auditions, or certificate verifications? Send us a message or reach out through our official channels.
        </p>
      </section>

      {/* 2. Main Grid: Contact Details & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              Committee Secretariat
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Department</h3>
                  <p className="text-plum-700 dark:text-ivory-300 mt-0.5 leading-relaxed">
                    Department of Information Science and Engineering, Kalpataru Institute of Technology (KIT).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Campus Address</h3>
                  <p className="text-plum-700 dark:text-ivory-300 mt-0.5 leading-relaxed">
                    B.H. Road, Tiptur, Tumakuru District, Karnataka - 572201, India.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Official Email</h3>
                  <p className="text-plum-700 dark:text-ivory-300 mt-0.5 font-mono">
                    clubanvaya@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Department Desk</h3>
                  <p className="text-plum-700 dark:text-ivory-300 mt-0.5 font-mono">
                    +91 8431 674384
                  </p>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-4 border-t border-ivory-200 dark:border-plum-800">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Social Presence
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/kit.anvaya.ise?cplk=d3pjdGYzbDU3M3Nr"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-ivory-100 dark:bg-plum-800 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@anvaya_kit"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-ivory-100 dark:bg-plum-800 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/anvaya-kit"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-ivory-100 dark:bg-plum-800 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/anvayaclub"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-ivory-100 dark:bg-plum-800 text-plum-700 dark:text-ivory-300 hover:text-gold-500 hover:scale-105 transition-all"
                  aria-label="GitHub"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Campus Map External Link Card */}
          <div className="p-6 rounded-2xl bg-ivory-100 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold text-plum-950 dark:text-ivory-50">Campus Location</div>
              <div className="text-gray-500 dark:text-gray-400 mt-0.5">KIT Campus on Google Maps</div>
            </div>
            <a
              href="https://maps.google.com/?q=Kalpataru+Institute+of+Technology+Tiptur"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-plum-850 text-gold-600 dark:text-gold-400 border border-ivory-300 dark:border-plum-700 shadow-sm hover:border-gold-500 transition-colors"
            >
              View Map →
            </a>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-lg space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
                Send a Message
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We typically respond within 1-2 working days.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-serif font-bold">Message Sent Successfully!</h3>
                <p className="text-xs leading-relaxed max-w-sm mx-auto">
                  Thank you for reaching out. Your communication has been dispatched to the Anvaya cultural committee secretariat.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-plum-900 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Vinay Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="vinay@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Collaboration on Inter-College Fest / Audition Query"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Provide details about your query or proposal..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
