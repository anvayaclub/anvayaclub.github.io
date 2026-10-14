import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Calendar, Clock, MapPin, CheckCircle2, Download, Printer, QrCode as QrIcon, ShieldCheck } from 'lucide-react';
import { AnvayaLogo } from '../common/AnvayaLogo';

interface DigitalEventPassProps {
  eventTitle: string;
  eventDate: string;
  startTime?: string;
  venue: string;
  fullName: string;
  usn: string;
  branch?: string;
  ticketCode: string;
  attended?: boolean;
  attendedAt?: string;
  onClose?: () => void;
}

export const DigitalEventPass: React.FC<DigitalEventPassProps> = ({
  eventTitle,
  eventDate,
  startTime,
  venue,
  fullName,
  usn,
  branch,
  ticketCode,
  attended = false,
  attendedAt,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const payload = JSON.stringify({
          ticket: ticketCode,
          usn: usn.toUpperCase(),
          event: eventTitle,
          org: 'ANVAYA-KIT',
        });
        const url = await QRCode.toDataURL(payload, {
          width: 220,
          margin: 1,
          color: {
            dark: '#1E112A',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate pass QR code:', err);
      }
    };

    if (ticketCode) {
      generateQr();
    }
  }, [ticketCode, usn, eventTitle]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = () => {
    // Generate .ics calendar invite file
    const icsDate = new Date(eventDate).toISOString().replace(/-|:|\.\d+/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Anvaya Cultural Committee//KIT Tiptur//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${eventTitle} — Anvaya Cultural Committee`,
      `DESCRIPTION:Your confirmed registration pass for ${eventTitle}. Ticket Code: ${ticketCode}. Attendee: ${fullName} (${usn}).`,
      `LOCATION:${venue}, Kalpataru Institute of Technology, Tiptur`,
      `DTSTART:${icsDate}`,
      `DTEND:${icsDate}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Anvaya-${eventTitle.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Boarding-Pass Style Card */}
      <div
        ref={passRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ivory-50 via-white to-ivory-100 dark:from-plum-950 dark:via-plum-900 dark:to-plum-950 border-2 border-gold-500/40 shadow-xl print:shadow-none print:border-black"
      >
        {/* Top Gold Accent Bar */}
        <div className="h-3 bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500" />

        {/* Pass Header */}
        <div className="p-6 border-b border-dashed border-ivory-300 dark:border-plum-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AnvayaLogo size="sm" />
            <div>
              <div className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">
                Official Digital Event Pass
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                Anvaya — Cultural Committee, ISE Dept, KIT Tiptur
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{attended ? 'Checked In' : 'Entry Pass Valid'}</span>
          </div>
        </div>

        {/* Pass Body: Grid Layout */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Left Details (8 cols) */}
          <div className="sm:col-span-8 space-y-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-gold-600 dark:text-gold-400">
                Cultural Programme
              </div>
              <h2 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50 mt-0.5">
                {eventTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono">Date</span>
                <div className="flex items-center gap-1.5 font-semibold text-plum-900 dark:text-ivory-100">
                  <Calendar className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                  <span>{eventDate}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono">Time</span>
                <div className="flex items-center gap-1.5 font-semibold text-plum-900 dark:text-ivory-100">
                  <Clock className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                  <span>{startTime || 'Report by 9:30 AM'}</span>
                </div>
              </div>

              <div className="space-y-0.5 col-span-2">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono">Venue</span>
                <div className="flex items-center gap-1.5 font-semibold text-plum-900 dark:text-ivory-100">
                  <MapPin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                  <span>{venue}</span>
                </div>
              </div>
            </div>

            {/* Attendee Details Strip */}
            <div className="p-3 rounded-2xl bg-ivory-100 dark:bg-plum-900/60 border border-ivory-200 dark:border-plum-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block font-mono">Attendee Name</span>
                <span className="font-bold text-plum-950 dark:text-ivory-50 truncate block">{fullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-mono">USN / Branch</span>
                <span className="font-mono font-bold text-gold-600 dark:text-gold-400 block">
                  {usn} {branch ? `• ${branch}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Right QR Code Section (4 cols) */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white dark:bg-plum-950 border border-ivory-200 dark:border-plum-800 space-y-2">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="w-36 h-36 rounded-xl border border-ivory-300 dark:border-plum-800"
              />
            ) : (
              <div className="w-36 h-36 rounded-xl bg-ivory-100 dark:bg-plum-900 flex items-center justify-center">
                <QrIcon className="w-10 h-10 text-gray-400 animate-pulse" />
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono block">Ticket Code</span>
              <span className="text-xs font-mono font-bold text-plum-950 dark:text-ivory-50 block tracking-wider">
                {ticketCode}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 leading-tight">
              Present this pass at the entrance to be scanned by committee volunteers.
            </p>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 bg-ivory-100/70 dark:bg-plum-900/30 border-t border-ivory-200 dark:border-plum-800/80 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
          <span>Carry your official college student ID card.</span>
          {attended && attendedAt && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Checked in at {new Date(attendedAt).toLocaleTimeString()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-plum-800 text-plum-950 dark:text-ivory-50 border border-ivory-300 dark:border-plum-700 hover:border-gold-500 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={handleDownloadCalendar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-plum-800 text-plum-950 dark:text-ivory-50 border border-ivory-300 dark:border-plum-700 hover:border-gold-500 transition-all shadow-sm"
            title="Download calendar reminder (.ics file)"
          >
            <Calendar className="w-3.5 h-3.5 text-gold-500" />
            <span>Add to Calendar</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-ivory-200 dark:hover:bg-plum-800 transition-all"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
