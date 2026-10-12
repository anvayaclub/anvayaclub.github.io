import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, CheckCircle2, Clock, Users, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { ContactSubmission, NewsletterSubscriber } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inqRes, subRes] = await Promise.all([
        api.communication.getContactSubmissions(),
        api.communication.getNewsletterSubscribers(),
      ]);
      if (inqRes.success) setInquiries(inqRes.data);
      if (subRes.success) setSubscribers(subRes.data);
    } catch (err: any) {
      error(err.message || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await api.communication.updateContactStatus(id, status);
      if (res.success) {
        success(`Inquiry marked as ${status}.`);
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
          Inquiries & Community Subscribers
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Review student contact inquiries and manage cultural bulletin subscribers.
        </p>
      </div>

      {/* 1. Contact Inquiries */}
      <div className="space-y-4">
        <h2 className="text-sm font-serif font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gold-500" />
          <span>Contact Submissions ({inquiries.length})</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading messages...</div>
        ) : inquiries.length > 0 ? (
          <div className="space-y-3">
            {inquiries.map(inq => (
              <div
                key={inq.id}
                className="p-5 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ivory-200 dark:border-plum-800 pb-2.5">
                  <div>
                    <span className="font-bold text-plum-950 dark:text-ivory-50">{inq.name}</span>
                    <span className="text-gray-400 ml-2 font-mono">({inq.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                      inq.status === 'replied' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700'
                    }`}>
                      {inq.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-gold-700 dark:text-gold-400">{inq.subject}</div>
                  <p className="text-plum-800 dark:text-ivory-200 mt-1 leading-relaxed">
                    {inq.message}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <a
                    href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                    onClick={() => handleUpdateStatus(inq.id, 'replied')}
                    className="px-3 py-1 rounded-lg bg-gold-600 text-white font-semibold text-xs hover:bg-gold-500"
                  >
                    Reply via Email
                  </a>
                  {inq.status !== 'read' && inq.status !== 'replied' && (
                    <button
                      onClick={() => handleUpdateStatus(inq.id, 'read')}
                      className="px-3 py-1 rounded-lg border border-ivory-300 dark:border-plum-700 text-gray-600 dark:text-gray-300"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 rounded-2xl border border-ivory-200 dark:border-plum-800">
            No contact submissions received yet.
          </div>
        )}
      </div>

      {/* 2. Newsletter Subscribers */}
      <div className="space-y-4 pt-6 border-t border-ivory-200 dark:border-plum-800">
        <h2 className="text-sm font-serif font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Mail className="w-4 h-4 text-peacock-500" />
          <span>Cultural Bulletin Subscribers ({subscribers.length})</span>
        </h2>

        {subscribers.length > 0 ? (
          <div className="rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-400 text-[10px] uppercase font-mono">
                <tr>
                  <th className="p-3">Subscriber Email</th>
                  <th className="p-3">Subscribed At</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                {subscribers.map(s => (
                  <tr key={s.id} className="hover:bg-ivory-50 dark:hover:bg-plum-850">
                    <td className="p-3 font-mono font-medium">{s.email}</td>
                    <td className="p-3 text-gray-400 font-mono text-[11px]">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                    <td className="p-3 text-emerald-600 font-semibold text-[11px]">Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-gray-400 rounded-2xl border border-ivory-200 dark:border-plum-800">
            No newsletter subscribers yet.
          </div>
        )}
      </div>
    </div>
  );
};
