import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

const CALENDLY_URL =
  'https://calendly.com/ninajchapuis/30min?hide_gdpr_banner=1&background_color=1a1a1a&text_color=faf9f5&primary_color=d948ef';

const CONTACT_EMAIL = 'hello@latitudemarketing.agency';

interface BookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = 'idle' | 'sending' | 'submitted' | 'error';

export const BookingSheet: React.FC<BookingSheetProps> = ({ isOpen, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', adSpend: '' });
  const [status, setStatus] = useState<FormStatus>('idle');
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!r.ok) throw new Error('send_failed');
      setStatus('submitted');
    } catch {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full bg-background/10 border border-background/20 text-background px-4 py-3 text-sm focus:border-accent transition-colors placeholder:text-background/30';

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[1000]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('booking.title')}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-foreground z-[1001] shadow-2xl animate-slide-in-right flex flex-col"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-8 right-8 text-background/70 hover:text-background transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col h-full px-10 pt-24 pb-10 overflow-y-auto">
          <h2 className="text-background text-3xl font-medium tracking-tight mb-2">
            {t('booking.title')}
          </h2>
          <p className="text-background/50 text-sm mb-8 leading-relaxed">
            {t('booking.sub')}
          </p>

          {/* Calendly Embed */}
          <div className="flex-1 min-h-[400px] mb-6">
            <iframe
              src={CALENDLY_URL}
              width="100%"
              height="100%"
              loading="lazy"
              className="min-h-[400px]"
              title={t('booking.title')}
            />
          </div>

          {/* Fallback Form - Collapsed */}
          <div className="border-t border-background/10 pt-4">
            <button
              onClick={() => setShowForm(!showForm)}
              aria-expanded={showForm}
              className="flex items-center gap-2 text-background/40 hover:text-background/60 transition-colors text-xs uppercase tracking-widest w-full"
            >
              <span>{t('booking.fallback')}</span>
              <ChevronDown size={14} className={`transition-transform ${showForm ? 'rotate-180' : ''}`} />
            </button>

            {showForm && (
              <form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-4">
                {status === 'submitted' ? (
                  <p className="text-background/70 text-sm" role="status">{t('booking.submitted')}</p>
                ) : (
                  <>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder={t('booking.fields.name')}
                      required
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder={t('booking.fields.email')}
                      required
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="organization"
                      autoComplete="organization"
                      placeholder={t('booking.fields.company')}
                      value={formData.company}
                      onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="adSpend"
                      placeholder={t('booking.fields.adSpend')}
                      value={formData.adSpend}
                      onChange={e => setFormData(p => ({ ...p, adSpend: e.target.value }))}
                      className={inputClass}
                    />
                    {status === 'error' && (
                      <p className="text-background/70 text-sm" role="alert">
                        {t('booking.error')}{' '}
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-2">
                          {CONTACT_EMAIL}
                        </a>
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full bg-accent text-accent-foreground font-medium py-3 px-6 uppercase text-xs tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {status === 'sending' ? t('booking.sending') : t('booking.submit')}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
