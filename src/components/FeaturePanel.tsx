import React from 'react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';
import { Motes } from '@/components/Motes';

/**
 * FeaturePanel — one bordered panel: copy on the left, art bleeding to the
 * right edge at full strength.
 *
 * This is the reference's composition, and the important part is what it is
 * NOT: the art is not a dimmed background behind the text. It occupies its own
 * 42% column, full height, full opacity, hard outer edge, with only the inner
 * edge feathered into the ground. Text and art sit beside each other; neither
 * is laid over the other.
 *
 * A background image at reduced opacity reads as a watermark. A full-strength
 * image holding its own column reads as art direction. Same asset, and the
 * difference is entirely in the composition.
 *
 * The art is decorative: aria-hidden, and the panel must read completely with
 * it absent. Below lg the image column is dropped rather than stacked — a
 * letterboxed strip of macro photography on a phone adds nothing.
 */

export interface FeaturePanelProps {
  index: string;
  title: string;
  body: string;
  /** Big figure under the copy. Optional. */
  stat?: { value: string; label: string };
  image: string;
  /** Mirror the art. Useful when its light falls the wrong way for the layout. */
  flip?: boolean;
  /** Drifting motes behind the copy column. */
  motes?: number;
  className?: string;
}

export const FeaturePanel: React.FC<FeaturePanelProps> = ({
  index,
  title,
  body,
  stat,
  image,
  flip = false,
  motes = 18,
  className,
}) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex min-h-[420px] lg:min-h-[500px] border border-border bg-background overflow-hidden',
        'transition-[opacity,transform] duration-700',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
    >
      {/* Copy column */}
      <div className="relative flex-1 min-w-0 p-8 lg:p-12">
        {motes > 0 && <Motes count={motes} seed={Number(index) * 9 + 2} />}
        <div className="relative">
          <span className="num text-sm text-muted-foreground">{index}</span>
          <h3 className="text-3xl lg:text-4xl tracking-tight mt-4 mb-6 text-foreground">
            {title}
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-8">
            {body}
          </p>
          {stat && (
            <div>
              {/* The mono rule is for FIGURES. A word set in Commit Mono at
                  display size reads as a typo, not as data — "Median" in the
                  stat slot looked like a bug. Mono only when there is a digit. */}
              <span
                className={cn(
                  'text-5xl lg:text-6xl text-foreground',
                  /\d/.test(stat.value) ? 'num' : 'tracking-tight',
                )}
              >
                {stat.value}
              </span>
              <span className="num block text-sm text-muted-foreground mt-2">{stat.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Art column — full height, full opacity, hard outer edge. */}
      <div className="hidden lg:block relative w-[42%] shrink-0 overflow-hidden">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={flip ? { transform: 'scaleX(-1)' } : undefined}
        />
        {/* Only the inner edge is feathered, so the art meets the panel border
            cleanly on the outside and dissolves into the copy column inside.
            Three stops, and the middle one is TRANSPARENT — this is the
            reference's gradient exactly (`from-black via-transparent
            to-transparent`). An earlier pass held `via-background/25`, which
            put a 25% veil across the middle of the frame and ~12% across the
            outer quarter: the whole image ran dim, not just its inner edge.
            That is the difference between a feathered join and a watermark,
            and it is the failure this composition exists to avoid. The veil
            must be spent inside the first half and be gone by the midpoint. */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>
    </div>
  );
};
