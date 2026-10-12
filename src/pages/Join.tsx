import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
  Heart,
  Users,
  Briefcase,
  Shield,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Join: React.FC = () => {
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [usn, setUsn] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [branch, setBranch] = useState('Information Science & Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState('');
  const [motivation, setMotivation] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availableInterests = [
    'Dance',
    'Singing',
    'Music and instruments',
    'Acting and theatre',
    'Anchoring and hosting',
    'Photography',
    'Videography',
    'Editing',
    'Graphic design',
    'Decoration and stage design',
    'Event management',
    'Public relations',
    'Writing and creative work',
    'Technical support for events',
    'Volunteering',
    'Other',
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      error('Please consent to the membership application policy.');
      return;
    }

    if (selectedInterests.length === 0) {
      error('Please select at least one cultural interest or area of contribution.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.membership.apply({
        fullName,
        usn: usn.trim().toUpperCase(),
        academicYear,
        branch,
        email,
        phone,
        interests: selectedInterests,
        skills,
        motivation,
        preferredRole,
      });

      if (res.success) {
        setSubmitted(true);
        success(res.message);
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      error(err.message || 'Application submission failed. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Recruitment & Auditions</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
          Join the Anvaya Community
        </h1>
        <p className="text-base text-plum-700 dark:text-ivory-200 leading-relaxed font-sans">
          Be a part of KIT Tiptur’s vibrant cultural committee. Whether you are an aspiring performer, seasoned organizer, creative designer, or passionate volunteer, Anvaya is your stage.
        </p>
      </section>

      {/* Main Grid: Membership Benefits (Left) & Application Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Benefits & Recruitment Notice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              Why Join Anvaya?
            </h2>
            <div className="space-y-4 text-xs text-plum-700 dark:text-ivory-300">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Inter-Collegiate Exposure</h3>
                  <p className="mt-0.5 leading-relaxed">
                    Represent Kalpataru Institute of Technology at VTU Youth Fests, zonal competitions, and state cultural showcases.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-peacock-500/10 text-peacock-600 dark:text-peacock-400 flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Executive Leadership</h3>
                  <p className="mt-0.5 leading-relaxed">
                    Gain hands-on experience managing budgets, stage production, digital PR, logistics, and student coordination.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Verified Recognition</h3>
                  <p className="mt-0.5 leading-relaxed">
                    Official committee credentials, certificates of merit, and recommendations recognized by department faculty.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-plum-950 dark:text-ivory-50">Lifelong Community</h3>
                  <p className="mt-0.5 leading-relaxed">
                    Collaborate with like-minded creative peers across semesters in an inspiring, supportive environment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-900 dark:text-gold-200 space-y-2">
            <div className="font-bold font-serif flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gold-600 dark:text-gold-400" />
              <span>Recruitment Guidelines</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Submissions are audited by the student executive committee and department faculty advisors. Selected applicants will be contacted via email/phone for personal interactions or troupe auditions.
            </p>
          </div>
        </div>

        {/* Right Column: Application Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-lg">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Application Received!
                </h2>
                <p className="text-sm text-plum-700 dark:text-ivory-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{fullName}</strong>. Your membership application for Anvaya has been safely recorded under USN <strong>{usn}</strong>. The committee coordinators will review your submission shortly.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFullName('');
                      setUsn('');
                      setEmail('');
                      setPhone('');
                      setSelectedInterests([]);
                      setSkills('');
                      setMotivation('');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-ivory-200 dark:bg-plum-800 text-plum-900 dark:text-ivory-50 hover:bg-gold-500 hover:text-white transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                <div>
                  <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
                    Membership Application Form
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    Please provide accurate details matching college records.
                  </p>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Varun Rao"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      University Seat Number (USN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={usn}
                      onChange={e => setUsn(e.target.value.toUpperCase())}
                      placeholder="1KI23IS088"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Department / Branch *
                    </label>
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      placeholder="Information Science & Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Student Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="student@kit-tiptur.ac.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      WhatsApp / Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    />
                  </div>
                </div>

                {/* Cultural Interests Checkboxes */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200">
                    Cultural Interests & Areas of Contribution * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableInterests.map(interest => {
                      const isChecked = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`p-2 rounded-xl text-left text-[11px] font-medium border transition-all flex items-center justify-between ${
                            isChecked
                              ? 'bg-gold-500/20 border-gold-500 text-gold-700 dark:text-gold-300 font-semibold'
                              : 'bg-ivory-50 dark:bg-plum-950/50 border-ivory-300 dark:border-plum-800 text-plum-800 dark:text-ivory-300 hover:border-gold-500/40'
                          }`}
                        >
                          <span className="truncate">{interest}</span>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skills & Experience */}
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Specific Skills / Past Experience *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="e.g. Classical vocals training for 4 years, Adobe Premiere Pro editing, DSLR cinematography..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 leading-relaxed"
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Motivation for Joining Anvaya *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={motivation}
                    onChange={e => setMotivation(e.target.value)}
                    placeholder="Why would you like to be part of the committee, and how can you contribute?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 leading-relaxed"
                  />
                </div>

                {/* Preferred Role (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Preferred Committee Wing or Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={preferredRole}
                    onChange={e => setPreferredRole(e.target.value)}
                    placeholder="e.g. Media & Photography Wing, Stage Management, Troupe Performer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="mt-0.5 rounded text-gold-500 focus:ring-gold-500"
                  />
                  <label htmlFor="consent" className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    I confirm that the submitted information is accurate and agree to abide by the committee rules, rehearsals, and ethical guidelines of KIT Tiptur.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500 hover:from-gold-500 hover:to-saffron-600 shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Submitting Application...' : 'Submit Membership Application'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
