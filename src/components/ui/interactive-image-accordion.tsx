import React, { useState } from 'react';

interface AccordionItem {
  id: number | string;
  title: string;
}

interface SliceProps {
  imageSrc: string;
  index: number;
  count: number;
}

// Every panel windows into the SAME image: slice N shows the Nth horizontal
// band, so the row reads as one composition spread across the pills.
const sliceStyle = ({ imageSrc, index, count }: SliceProps): React.CSSProperties => ({
  backgroundImage: `url(${imageSrc})`,
  backgroundSize: 'cover',
  backgroundPosition: `${count > 1 ? (index / (count - 1)) * 100 : 50}% center`,
});

interface PanelProps {
  item: AccordionItem;
  slice: SliceProps;
  isActive: boolean;
  onMouseEnter: () => void;
  onClick?: () => void;
}

const DesktopPanel: React.FC<PanelProps> = ({ item, slice, isActive, onMouseEnter, onClick }) => {
  return (
    <button
      type="button"
      aria-label={item.title}
      className={`
        relative h-[450px] overflow-hidden cursor-pointer bg-foreground
        transition-all duration-500 ease-in-out
        ${isActive ? 'w-[400px]' : 'w-[60px]'}
      `}
      style={sliceStyle(slice)}
      onMouseEnter={onMouseEnter}
      onFocus={onMouseEnter}
      onClick={onClick}
    >
      <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-foreground/30' : 'bg-foreground/55'}`} />

      <span
        className={`
          absolute text-background font-medium uppercase tracking-[0.15em] whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${
            isActive
              ? 'text-sm bottom-6 left-1/2 -translate-x-1/2 rotate-0'
              : 'text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90'
          }
        `}
      >
        {item.title}
      </span>
    </button>
  );
};

interface InteractiveImageAccordionProps {
  items: AccordionItem[];
  imageSrc: string;
  defaultActiveIndex?: number;
  onItemClick?: (id: string | number) => void;
}

export const InteractiveImageAccordion: React.FC<InteractiveImageAccordionProps> = ({
  items,
  imageSrc,
  defaultActiveIndex = 0,
  onItemClick,
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  return (
    <div className="w-full">
      {/* Desktop: hover accordion, one image across all panels */}
      <div className="hidden md:flex flex-row items-center justify-center gap-3">
        {items.map((item, index) => (
          <DesktopPanel
            key={item.id}
            item={item}
            slice={{ imageSrc, index, count: items.length }}
            isActive={index === activeIndex}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={onItemClick ? () => onItemClick(item.id) : undefined}
          />
        ))}
      </div>

      {/* Mobile: static grid of slices, horizontal labels */}
      <div className="md:hidden grid grid-cols-2 gap-[2px]">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="relative h-28 overflow-hidden bg-foreground text-left"
            style={sliceStyle({ imageSrc, index, count: items.length })}
            onClick={onItemClick ? () => onItemClick(item.id) : undefined}
          >
            <div className="absolute inset-0 bg-foreground/55" />
            <span className="absolute bottom-3 left-3 right-3 text-background text-[10px] font-medium uppercase tracking-[0.15em] leading-snug">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
