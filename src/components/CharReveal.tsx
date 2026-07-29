import React, { useMemo } from 'react';
import { useInView, useReducedMotion } from '@/hooks/useInView';

/**
 * CharReveal — headline that rises character by character on entry.
 *
 * Ported from the reference's `char-in`: each glyph starts 60% below its line
 * and translates up on a decelerating curve, staggered a few milliseconds
 * apart. Read at speed it looks like the line is being set rather than faded in.
 *
 * Accessibility matters more than the effect here. Splitting a headline into
 * per-character spans destroys it for a screen reader — it announces the
 * letters individually, or worse, as nonsense. So the real text is rendered
 * once in a visually-hidden span, and the animated glyphs are aria-hidden
 * decoration. The heading always announces as one string.
 *
 * Words are kept intact as inline-block units so the line still wraps on word
 * boundaries rather than mid-word.
 */

export interface CharRevealProps {
  text: string;
  /** ms between adjacent characters. */
  stagger?: number;
  /** ms before the first character moves. */
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
}

export const CharReveal: React.FC<CharRevealProps> = ({
  text,
  stagger = 18,
  delay = 0,
  className = '',
  as: Tag = 'h2',
}) => {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLHeadingElement>({ threshold: 0.3 });

  const words = useMemo(() => text.split(' '), [text]);

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  let index = 0;
  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {/* Announced text. The glyphs below are decoration only. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline">
        {words.map((word, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch) => {
              const i = index++;
              return (
                <span
                  key={i}
                  className="inline-block overflow-hidden align-bottom"
                >
                  <span
                    className={inView ? 'inline-block animate-char-in' : 'inline-block opacity-0'}
                    style={{ animationDelay: `${delay + i * stagger}ms` }}
                  >
                    {ch}
                  </span>
                </span>
              );
            })}
            {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  );
};
