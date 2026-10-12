import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Compass, Shield, Users, Trophy, Music, Palette, BookOpen, Film, ArrowRight } from 'lucide-react';
import { AnvayaLogo } from '../components/common/AnvayaLogo';

export const About: React.FC = () => {
  const domains = [
    {
      title: 'Performing Arts & Dance',
      icon: <Sparkles className="w-5 h-5 text-gold-500" />,
      desc: 'Classical Bharatanatyam, Yakshagana, contemporary styles, and Karnataka folk choreographies representing the college at VTU youth festivals.',
    },
    {
      title: 'Music & Vocals',
      icon: <Music className="w-5 h-5 text-peacock-500" />,
      desc: 'Sugama Sangeetha, Carnatic renditions, light music, and acoustic instrumental ensembles providing live musical accompaniment.',
    },
    {
      title: 'Theatre, Drama & Mime',
      icon: <Film className="w-5 h-5 text-purple-500" />,
      desc: 'One-act street plays (Beedi Nataka), social satires, skits, and mime acts that address societal dilemmas and campus humor.',
    },
    {
      title: 'Fine Arts & Photography',
      icon: <Palette className="w-5 h-5 text-saffron-500" />,
      desc: 'Oil canvas painting, digital concept art, live caricatures, photography exhibitions, and stage decoration crafts.',
    },
    {
      title: 'Literary & Public Speaking',
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      desc: 'Kannada and English elocution, poetry recitations, debate forums, and anchoring college symposiums.',
    },
    {
      title: 'Event Management & Logistics',
      icon: <Users className="w-5 h-5 text-amber-500" />,
      desc: 'Sound engineering, stage lighting, public relations, sponsorship coordination, and digital certificate verification.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* 1. Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
          <span>Department Cultural Committee</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
          The Story & Spirit of Anvaya
        </h1>
        <p className="text-base text-plum-700 dark:text-ivory-200 leading-relaxed font-sans">
          Nurturing holistic development, cultural preservation, and creative expression for the Information Science & Engineering community at Kalpataru Institute of Technology, Tiptur.
        </p>
      </section>

      {/* 2. Brand Identity & Vision / Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 shadow-sm">
            <AnvayaLogo size="md" />
            <div className="text-left">
              <div className="text-xs font-serif font-bold text-plum-950 dark:text-ivory-50">
                Official Cultural Body
              </div>
              <div className="text-[10px] text-gray-500">ISE · KIT Tiptur</div>
            </div>
          </div>

          <h2 className="text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Fostering Balanced Engineers with Artistic Sensitivity
          </h2>

          <p className="text-sm text-plum-700 dark:text-ivory-300 leading-relaxed">
            Founded within the Department of Information Science and Engineering, Anvaya emerged from the belief that technical excellence and creative expression go hand-in-hand. Engineering equips students with analytical problem-solving skills, while cultural engagement cultivates emotional intelligence, teamwork, public presence, and empathy.
          </p>

          <p className="text-sm text-plum-700 dark:text-ivory-300 leading-relaxed">
            From the historic town of Tiptur—rich in Karnataka folklore, academic rigor, and scenic serenity—Anvaya provides a premier collegiate stage for students from diverse backgrounds to come together, create memories, and showcase their talents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800 space-y-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 w-fit">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">Our Vision</h3>
            <p className="text-xs text-plum-700 dark:text-ivory-300 leading-relaxed">
              To be the benchmark student cultural forum across VTU, inspiring engineers to champion heritage, contemporary arts, and collective leadership.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800 space-y-3">
            <div className="p-2.5 rounded-xl bg-peacock-500/10 text-peacock-600 dark:text-peacock-400 w-fit">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">Our Mission</h3>
            <p className="text-xs text-plum-700 dark:text-ivory-300 leading-relaxed">
              To host meaningful intra and inter-college cultural programmes, mentor novice performers, and uphold ethical student committee governance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800 space-y-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">Our Core Values</h3>
            <p className="text-xs text-plum-700 dark:text-ivory-300 leading-relaxed">
              Inclusivity across all academic years, respect for regional heritage, artistic authenticity, and merit-driven recognition.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800 space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">Student Growth</h3>
            <p className="text-xs text-plum-700 dark:text-ivory-300 leading-relaxed">
              Transforming stage fright into confident stage presence, leadership capability, and lifelong networking friendships.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Cultural Activities & Domains */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 font-sans">
            Areas of Activity
          </div>
          <h2 className="text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Cultural Programme Categories
          </h2>
          <p className="text-xs sm:text-sm text-plum-700 dark:text-ivory-300">
            From classical roots to contemporary tech integrations, our active wings welcome every student passion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((d, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-plum-900/80 border border-ivory-200 dark:border-plum-800 space-y-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-3 rounded-xl bg-ivory-100 dark:bg-plum-800 w-fit">{d.icon}</div>
              <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                {d.title}
              </h3>
              <p className="text-xs text-plum-700 dark:text-ivory-300 leading-relaxed">
                {d.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Leadership & Call to Action */}
      <section className="p-8 sm:p-12 rounded-3xl bg-ivory-100 dark:bg-plum-900/80 border border-ivory-300 dark:border-plum-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Meet the Student Coordinators Behind Anvaya
          </h2>
          <p className="text-xs sm:text-sm text-plum-700 dark:text-ivory-300 leading-relaxed font-sans">
            Our committee is managed by elected and selected student leaders from the ISE department—working in close consultation with faculty coordinators and the Head of Department.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-white dark:bg-plum-800 text-plum-950 dark:text-ivory-50 border border-ivory-300 dark:border-plum-700 hover:border-gold-500 hover:text-gold-600 transition-colors shadow-sm"
          >
            <span>View Team Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/join"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 shadow-md hover:from-gold-500 hover:to-saffron-600 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply to Join</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
