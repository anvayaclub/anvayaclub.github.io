import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileText, CheckCircle2, QrCode, Award, Shield, Copy, Check } from 'lucide-react';
import { AnvayaLogo } from '../common/AnvayaLogo';
import { LinkedinIcon } from '../common/SocialIcons';

export interface VerifiedCertificateData {
  certificateNumber: string;
  recipientName: string;
  usn: string;
  eventTitle: string;
  eventDate: string;
  certificateTitle: string;
  bodyTemplate: string;
  signatories: Array<{ name: string; role: string; signatureUrl?: string }>;
  issuedAt?: string;
  institutionName?: string;
  departmentName?: string;
}

interface CertificatePreviewProps {
  data: VerifiedCertificateData;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data }) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const downloadPNG = async () => {
    if (!certRef.current) return;
    setDownloadingPng(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Anvaya-Certificate-${data.usn}-${data.certificateNumber}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG certificate:', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  const downloadPDF = async () => {
    if (!certRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Anvaya-Certificate-${data.usn}-${data.certificateNumber}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF certificate:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const addToLinkedIn = () => {
    const certTitle = data.certificateTitle || `${data.eventTitle} — Certificate of Participation`;
    const orgName = 'Anvaya — Department of Information Science & Engineering, KIT Tiptur';

    // Parse issue year and month if available
    const dateObj = data.issuedAt ? new Date(data.issuedAt) : new Date();
    const issueYear = dateObj.getFullYear();
    const issueMonth = dateObj.getMonth() + 1;

    const verificationUrl = `${window.location.origin}/certificate?id=${encodeURIComponent(data.certificateNumber)}`;

    const linkedInUrl = new URL('https://www.linkedin.com/profile/add');
    linkedInUrl.searchParams.set('startTask', 'CERTIFICATION_NAME');
    linkedInUrl.searchParams.set('name', certTitle);
    linkedInUrl.searchParams.set('organizationName', orgName);
    linkedInUrl.searchParams.set('issueYear', String(issueYear));
    linkedInUrl.searchParams.set('issueMonth', String(issueMonth));
    linkedInUrl.searchParams.set('certUrl', verificationUrl);
    linkedInUrl.searchParams.set('certId', data.certificateNumber);

    window.open(linkedInUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  const copyVerificationLink = () => {
    const verificationUrl = `${window.location.origin}/certificate?id=${encodeURIComponent(data.certificateNumber)}`;
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Action Download & Professional Integration Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-ivory-100 dark:bg-plum-900 border border-ivory-300 dark:border-plum-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-plum-950 dark:text-ivory-50">
              Verified Certificate Available
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              ID: {data.certificateNumber}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add to LinkedIn Button */}
          <button
            onClick={addToLinkedIn}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] transition-all shadow-sm"
            title="Add this verified credential directly to your LinkedIn profile"
          >
            <LinkedinIcon className="w-4 h-4 text-white" />
            <span>Add to LinkedIn</span>
          </button>

          {/* Copy Verification Link Button */}
          <button
            onClick={copyVerificationLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-plum-800 text-plum-950 dark:text-ivory-50 border border-ivory-300 dark:border-plum-700 hover:border-gold-500 transition-all shadow-sm"
            title="Copy unique public verification URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          {/* Download PNG Button */}
          <button
            onClick={downloadPNG}
            disabled={downloadingPng}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-plum-800 text-plum-950 dark:text-ivory-50 border border-ivory-300 dark:border-plum-700 hover:border-gold-500 hover:text-gold-600 transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-gold-500" />
            <span>{downloadingPng ? 'Generating...' : 'PNG'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={downloadPDF}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-600 hover:from-gold-500 hover:to-saffron-500 shadow-md transition-all disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{downloadingPdf ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* The Certificate Canvas Card (Designed for print-ready landscape 4:3 or A4 aspect ratio) */}
      <div className="overflow-x-auto pb-4">
        <div
          ref={certRef}
          className="w-[880px] min-w-[880px] mx-auto p-10 bg-[#FCFBF7] text-[#1E112A] rounded-xl shadow-2xl relative border-[12px] border-[#D4AF37] select-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Inner Ornate Border */}
          <div className="border-2 border-[#1E112A]/20 p-8 relative">
            {/* Corner Ornamental Accents */}
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-[#C9981B]"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-[#C9981B]"></div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-[#C9981B]"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-[#C9981B]"></div>

            {/* Header: Logos & Institutional Identification */}
            <div className="flex items-center justify-between border-b-2 border-[#D4AF37]/30 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <AnvayaLogo size="certificate" />
              </div>

              <div className="text-right">
                <div className="text-xs uppercase font-bold tracking-widest text-[#7E5A9B]">
                  Kalpataru Vidya Samsthe (R.)
                </div>
                <div className="text-base font-serif font-bold text-[#1E112A] tracking-wide">
                  KALPATARU INSTITUTE OF TECHNOLOGY
                </div>
                <div className="text-xs font-medium text-[#4D3064]">
                  Department of Information Science & Engineering
                </div>
                <div className="text-[10px] text-gray-500">
                  Affiliated to VTU, Belagavi · Approved by AICTE, New Delhi · Tiptur, Karnataka
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center my-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#A77712] text-xs uppercase tracking-widest font-semibold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>ANVAYA CULTURAL COMMITTEE</span>
              </div>
              <h2 className="text-3xl font-serif font-extrabold text-[#1E112A] tracking-wider uppercase mt-1">
                {data.certificateTitle}
              </h2>
            </div>

            {/* Certificate Body Text */}
            <div className="text-center max-w-2xl mx-auto space-y-4 my-8 text-sm leading-relaxed text-[#2D1F38]">
              <p className="text-sm uppercase tracking-widest text-gray-600">This is proudly presented to</p>

              <div className="py-2 border-b-2 border-[#D4AF37]/50 inline-block px-12">
                <span className="text-2xl font-serif font-bold text-[#1E112A] tracking-wide">
                  {data.recipientName}
                </span>
                {data.usn && (
                  <span className="block text-xs font-mono font-semibold text-[#644280] mt-1">
                    USN: {data.usn}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed px-4">
                {data.bodyTemplate}
              </p>

              <div className="pt-2 text-base font-serif font-bold text-[#1E112A]">
                {data.eventTitle}
              </div>
              <div className="text-xs text-gray-500 italic">
                Conducted on {data.eventDate}
              </div>
            </div>

            {/* Signatures & Footer Verification */}
            <div className="mt-12 pt-6 border-t border-[#D4AF37]/30 flex items-end justify-between">
              {/* QR Verification Tag & Certificate Number */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded border border-gray-300 bg-white shadow-sm">
                  <QrCode className="w-12 h-12 text-[#1E112A]" />
                </div>
                <div className="text-left text-[10px] text-gray-600">
                  <div className="flex items-center gap-1 font-semibold text-[#167A80]">
                    <Shield className="w-3 h-3" />
                    <span>Cryptographically Verified</span>
                  </div>
                  <div className="font-mono mt-0.5 font-bold text-[#1E112A]">
                    {data.certificateNumber}
                  </div>
                  <div className="text-gray-400 text-[9px] mt-0.5">
                    Verify at kit-tiptur.ac.in/anvaya/certificate
                  </div>
                </div>
              </div>

              {/* Dynamic Signatories (up to 3) */}
              <div className="flex items-end gap-10">
                {data.signatories && data.signatories.length > 0 ? (
                  data.signatories.map((sig, idx) => (
                    <div key={idx} className="text-center min-w-[120px]">
                      {sig.signatureUrl ? (
                        <img
                          src={sig.signatureUrl}
                          alt={sig.name}
                          className="h-10 mx-auto object-contain mb-1"
                        />
                      ) : (
                        <div className="h-8 border-b border-gray-400 mb-1 w-28 mx-auto"></div>
                      )}
                      <div className="text-xs font-semibold text-[#1E112A]">{sig.name}</div>
                      <div className="text-[10px] text-gray-500">{sig.role}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-center min-w-[120px]">
                      <div className="h-8 border-b border-gray-400 mb-1 w-28 mx-auto"></div>
                      <div className="text-xs font-semibold text-[#1E112A]">HOD, Dept of ISE</div>
                      <div className="text-[10px] text-gray-500">KIT Tiptur</div>
                    </div>
                    <div className="text-center min-w-[120px]">
                      <div className="h-8 border-b border-gray-400 mb-1 w-28 mx-auto"></div>
                      <div className="text-xs font-semibold text-[#1E112A]">Cultural Coordinator</div>
                      <div className="text-[10px] text-gray-500">Anvaya KIT</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
