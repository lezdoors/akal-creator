import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';

/**
 * Lead sheet. No third-party scheduler embed — the form posts to /api/lead.
 * Copy lives inline; i18n is retired.
 */

const CONTACT_EMAIL = 'creator@akalds.com';

const BUDGET_BANDS = [
  'Under $5k / month',
  '$5k – $15k / month',
  '$15k – $50k / month',
  '$50k+ / month',
  'Not decided yet',
];

interface BookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = 'idle' | 'sending' | 'submitted' | 'error';

const EMPTY = { name: '', email: '', company: '', budget: '', message: '' };

export const BookingSheet: React.FC<BookingSheetProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(EMPTY);
  const [status, setStatus] = useState<FormStatus>('idle');

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

  const set = (k: keyof typeof EMPTY) => (v: string) =>
    setFormData(p => ({ ...p, [k]: v }));

  const fieldClass =
    'w-full min-w-0 bg-background border border-border text-foreground px-3 py-2.5 text-sm ' +
    'focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/70';

  const labelClass = 'row-label block mb-1.5';

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-foreground/30 z-[1000]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Start a campaign"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-[1001] animate-slide-in-right flex flex-col min-w-0"
      >
        <div className="flex items-center justify-between gap-4 px-6 md:px-8 h-16 border-b border-border shrink-0 min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-foreground text-[15px] font-bold tracking-[0.18em] uppercase leading-none">
              AKAL
            </span>
            <span className="num text-[10px] uppercase tracking-[0.16em] text-muted-foreground leading-none">
              / Creator
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 min-w-0">
          <p className="row-label mb-3">01 / Brief</p>
          <h2 className="text-foreground text-2xl font-medium tracking-tight mb-2">
            Start a campaign
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Tell us what you sell and what you can spend. We come back with a
            creator shortlist, rates, and a projected cost per signup.
          </p>

          {status === 'submitted' ? (
            <div className="border-t border-border pt-5">
              <p className="text-foreground text-sm leading-relaxed" role="status">
                Received. We reply from{' '}
                <span className="num">{CONTACT_EMAIL}</span> within one working day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 min-w-0">
              <div className="min-w-0">
                <label htmlFor="lead-name" className={labelClass}>
                  Name
                </label>
                <input
                  id="lead-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={e => set('name')(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="lead-email" className={labelClass}>
                  Work email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={e => set('email')(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="lead-company" className={labelClass}>
                  Company
                </label>
                <input
                  id="lead-company"
                  type="text"
                  name="organization"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={e => set('company')(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="lead-budget" className={labelClass}>
                  Monthly creator budget
                </label>
                {/* `num` on the select: the bands are figures, and register
                    rule 5 puts every figure in Commit Mono tabular. */}
                <div className="relative min-w-0">
                  <select
                    id="lead-budget"
                    name="budget"
                    required
                    value={formData.budget}
                    onChange={e => set('budget')(e.target.value)}
                    className={`num ${fieldClass} appearance-none pr-9 ${
                      formData.budget ? '' : 'text-muted-foreground/70'
                    }`}
                  >
                    <option value="" disabled>
                      Select a band
                    </option>
                    {BUDGET_BANDS.map(band => (
                      <option key={band} value={band} className="text-foreground">
                        {band}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="lead-message" className={labelClass}>
                  What are you launching?
                </label>
                <textarea
                  id="lead-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={e => set('message')(e.target.value)}
                  className={`${fieldClass} resize-y`}
                />
              </div>

              {status === 'error' && (
                <p className="text-negative text-sm leading-relaxed" role="alert">
                  That did not send. Email us at{' '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="num underline underline-offset-2"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-accent text-accent-foreground font-medium py-3 px-6 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending…' : 'Send brief'}
              </button>

              <p className="row-label !text-[10px] leading-relaxed">
                No newsletter, no sequence. One reply from a person.
              </p>
            </form>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
