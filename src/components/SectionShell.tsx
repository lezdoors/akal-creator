import React from 'react';
import { cn } from '@/lib/utils';
import { Motes } from '@/components/Motes';
import { ConnectorField } from '@/components/ConnectorField';
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
  /** Drifting points of light behind the section. 0 = none. */
  motes?: number;
  /** Self-drawing connector lattice behind the section. */
  field?: boolean;
  /** Full-bleed image behind the section, right-anchored and heavily dimmed.
   *  Never carries meaning — the copy must read with it absent. */
  image?: string;
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
  motes = 0,
  field = false,
  image,
}) => (
  <section
    id={id}
    className={cn(
      'w-full',
      'relative',
      hairline && 'border-t border-border',
      // Alternate white / band down the page. Derived from the section index
      // rather than threaded through every call site, so the rhythm can never
      // drift out of step when sections are reordered or inserted.
      (tone ?? (Number(index) % 2 === 0 ? 'band' : 'paper')) === 'band' && 'bg-secondary',
      className,
    )}
  >
    {image && (
      /* Sticky so the art holds position through tall sections (the manifesto
         runs 2.4 viewports). h-full on a section that tall stretches the image
         to several thousand pixels wide and pushes it off-frame. */
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <img
            src={image}
            alt=""
            className="absolute right-0 top-1/2 -translate-y-1/2 h-[78%] w-auto max-w-[62%] object-contain opacity-95
                       [mask-image:radial-gradient(ellipse_60%_58%_at_45%_50%,#000_55%,transparent_82%)]
                       [-webkit-mask-image:radial-gradient(ellipse_60%_58%_at_45%_50%,#000_55%,transparent_82%)]"
            loading="lazy"
            decoding="async"
          />
          {/* A radial mask feathers the frame edges to nothing. mix-blend-screen
              was the obvious fix but does not work here: the sticky+overflow
              wrapper opens a stacking context, so the blend resolves against
              transparent rather than the section colour and the rectangle
              stays visible. The mask does not care about stacking context. */}
          <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
      </div>
    )}
    {field && <ConnectorField seed={Number(index) * 7 + 1} />}
    {motes > 0 && <Motes count={motes} seed={Number(index) * 13 + 5} />}
    <div className="relative mx-auto w-full max-w-[1280px] px-6">
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
