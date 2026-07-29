import React from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/Reveal';

export interface SectionShellProps {
  /** Two-digit section number shown in the gutter, e.g. "01". */
  index: string;
  /** Gutter label, uppercase, e.g. "SOURCING". Rendered as `{index} / {label}`. */
  label: string;
  /** Section headline. Sits in the content columns, left-aligned. */
  title: React.ReactNode;
  /** Everything below the headline. */
  children?: React.ReactNode;
  /** Anchor id for nav links. */
  id?: string;
  /** Extra classes on the <section> element. */
  className?: string;
  /** Extra classes on the content column. */
  contentClassName?: string;
  /** One-line standfirst under the headline. Optional. */
  lede?: React.ReactNode;
  /** Top hairline. Default true — omit only when the section above already ruled. */
  hairline?: boolean;
  /** 'band' uses the secondary paper value to separate adjacent sections. */
  tone?: 'paper' | 'band';
}

/**
 * The core layout primitive. Every section on the page uses it, which is what
 * makes the page read as one document rather than a stack of blocks.
 *
 * Renders:
 *   · a full-width 1px hairline across the top
 *   · a 1280px, 24px-gutter, 12-column grid
 *   · the mono row label ("01 / SOURCING") in the LEFT GUTTER, sticky inside
 *     its own section so it pins on entry and releases at the section end
 *   · the title and children in the content columns
 *
 * Left-aligned throughout. Grid children carry `min-w-0` so wide content
 * (tables, ledgers, oversized type) can never push the page sideways at 390px.
 */
export const SectionShell: React.FC<SectionShellProps> = ({
  index,
  label,
  title,
  children,
  id,
  className,
  contentClassName,
  lede,
  hairline = true,
  tone,
}) => (
  <section
    id={id}
    className={cn(
      'w-full',
      hairline && 'border-t border-border',
      // Alternate white / band down the page. Derived from the section index
      // rather than threaded through every call site, so the rhythm can never
      // drift out of step when sections are reordered or inserted.
      (tone ?? (Number(index) % 2 === 0 ? 'band' : 'paper')) === 'band' && 'bg-secondary',
      className,
    )}
  >
    <div className="mx-auto w-full max-w-[1280px] px-6">
      <div className="grid grid-cols-12 gap-x-6 md:gap-x-8 py-16 md:py-24">
        {/* Left gutter — pins and releases within this section only. */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 min-w-0 self-start md:sticky md:top-24 mb-8 md:mb-0">
          <div className="row-label">
            {index} / {label}
          </div>
          <div className="hidden md:block mt-3 w-8 border-t border-border" />
        </div>

        {/* Content columns. */}
        <div
          className={cn(
            'col-span-12 md:col-span-9 lg:col-span-10 min-w-0',
            contentClassName,
          )}
        >
          <Reveal
            as="h2"
            className="text-[clamp(1.85rem,4.2vw,3.1rem)] font-medium leading-[1.06] tracking-[-0.022em] max-w-[22ch]"
          >
            {title}
          </Reveal>

          {lede && (
            <Reveal
              as="p"
              delay={100}
              className="mt-5 max-w-[58ch] text-[15px] md:text-base leading-relaxed text-muted-foreground"
            >
              {lede}
            </Reveal>
          )}

          {children && <div className="mt-10 md:mt-14 min-w-0">{children}</div>}
        </div>
      </div>
    </div>
  </section>
);

export default SectionShell;
