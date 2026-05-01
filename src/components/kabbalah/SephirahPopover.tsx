'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GOLDEN_DAWN_CORRESPONDENCES } from '@/lib/kabbalah/goldenDawn';
import { getSephirahDefinition } from '@/lib/kabbalah/sephiroth';
import type { SephirahName, SephirothMapping } from '@/lib/kabbalah/types';
import type { SephirahScore } from '@/lib/kabbalah/scoring';

interface SephirahPopoverProps {
  readonly sephirahName: SephirahName;
  readonly mapping: SephirothMapping;
  readonly score?: SephirahScore;
  readonly anchorRect: DOMRect | null;
  readonly onClose: () => void;
  readonly onMouseEnter?: () => void;
  readonly onMouseLeave?: () => void;
}

function isValid(value: string): boolean {
  return value !== '-' && value.trim() !== '';
}

function getPopoverStyle(anchorRect: DOMRect): CSSProperties {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const maxWidth = Math.min(viewportWidth - 24, 380);
  const maxHeight = viewportHeight * 0.7;

  let left = anchorRect.right + 12;
  let top: number | undefined = Math.max(12, anchorRect.top);
  let bottom: number | undefined;

  if (left + maxWidth > viewportWidth - 12) {
    left = anchorRect.left - 12 - maxWidth;
  }

  if (left < 12) {
    left = (viewportWidth - maxWidth) / 2;
    top = anchorRect.bottom + 12;
    if (top + maxHeight > viewportHeight - 12) {
      bottom = viewportHeight - anchorRect.top + 12;
      top = undefined;
    }
  }

  const style: CSSProperties = {
    position: 'fixed',
    width: `${maxWidth}px`,
    maxWidth: `${maxWidth}px`,
    maxHeight: `${maxHeight}px`,
    left: `${left}px`,
    zIndex: 1000,
  };

  if (top !== undefined) {
    style.top = `${top}px`;
    if (top + maxHeight > viewportHeight - 12) {
      delete style.top;
      style.bottom = '12px';
    }
  }

  if (bottom !== undefined) {
    style.bottom = `${bottom}px`;
  }

  return style;
}

function FieldRow({ label, value }: { readonly label: string; readonly value: string }) {
  if (!isValid(value)) return null;

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{label}</span>
      <span className="text-sm leading-relaxed text-slate-100">{value}</span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold-200 font-bold">{title}</p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function getAccentClasses(name: SephirahName): { readonly headerTop: string; readonly hebrew: string } {
  const accentClassBySephirah: Record<SephirahName, { readonly headerTop: string; readonly hebrew: string }> = {
    Kether: { headerTop: 'border-t-[#FFFFFF]', hebrew: 'text-[#FFFFFF]' },
    Chokmah: { headerTop: 'border-t-[#A9A9A9]', hebrew: 'text-[#A9A9A9]' },
    Binah: { headerTop: 'border-t-[#000000]', hebrew: 'text-[#D1D5DB]' },
    Daath: { headerTop: 'border-t-[#D8BFD8]', hebrew: 'text-[#D8BFD8]' },
    Chesed: { headerTop: 'border-t-[#0000FF]', hebrew: 'text-[#3B82F6]' },
    Geburah: { headerTop: 'border-t-[#FF0000]', hebrew: 'text-[#EF4444]' },
    Tiphereth: { headerTop: 'border-t-[#FFD700]', hebrew: 'text-[#FACC15]' },
    Netzach: { headerTop: 'border-t-[#008000]', hebrew: 'text-[#22C55E]' },
    Hod: { headerTop: 'border-t-[#FFA500]', hebrew: 'text-[#F59E0B]' },
    Yesod: { headerTop: 'border-t-[#8A2BE2]', hebrew: 'text-[#A855F7]' },
    Malkuth: { headerTop: 'border-t-[#1A1A1A]', hebrew: 'text-[#9CA3AF]' },
  };

  return accentClassBySephirah[name];
}

export default function SephirahPopover({
  sephirahName,
  mapping,
  anchorRect,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: SephirahPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const definition = getSephirahDefinition(sephirahName);
  const accent = getAccentClasses(sephirahName);
  const goldenDawn = GOLDEN_DAWN_CORRESPONDENCES[sephirahName];
  const style = useMemo(() => (anchorRect ? getPopoverStyle(anchorRect) : undefined), [anchorRect]);
  const planetName = 'planetName' in mapping ? mapping.planetName : 'Ascendente';
  const planetSymbol = 'planetSymbol' in mapping ? mapping.planetSymbol : 'ASC';

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (
        popoverRef.current && 
        target instanceof Element && 
        !popoverRef.current.contains(target) &&
        !target.closest('[data-sephirah]')
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [onClose]);

  if (!anchorRect || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        role="dialog"
        aria-live="polite"
        aria-label={`Detalhes de ${definition.name}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={style}
        className="pointer-events-auto flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className={`flex items-start justify-between gap-4 border-b border-t border-white/5 bg-white/5 px-4 py-3 ${accent.headerTop}`}>
          <div className="min-w-0">
            <p className="text-lg font-black tracking-tight text-white">
              {definition.name} <span className="text-slate-400">·</span>{' '}
              <span className={accent.hebrew}>{definition.hebrew}</span>
            </p>
            <p className="mt-1 text-sm text-slate-300">{definition.meaning}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-12">
          <DetailSection title="Correspondências da Golden Dawn">
            <FieldRow label="Nome Divino" value={`${goldenDawn.divineName.hebrew} · ${goldenDawn.divineName.transliteration}`} />
            <FieldRow label="Arcanjo" value={`${goldenDawn.archangel.hebrew} · ${goldenDawn.archangel.transliteration}`} />
            <FieldRow label="Coro Angélico" value={goldenDawn.choir.pt} />
          </DetailSection>

          <DetailSection title="Mapa Natal">
            <FieldRow
              label="Planeta"
              value={`${planetName} · ${planetSymbol} · ${mapping.sign} ${mapping.degree.toFixed(1)}° · Casa ${mapping.house}`}
            />
          </DetailSection>

          <DetailSection title="Anjo do Shemhamphorash">
            <FieldRow label="Nome" value={`${mapping.angel.name} · ${mapping.angel.hebrew}`} />
            <FieldRow label="Hierarquia" value={mapping.angel.hierarchy} />
          </DetailSection>

          <DetailSection title="Versículo do Salmo">
            <FieldRow label="Referência" value={mapping.angel.psalm} />
            <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Texto</p>
              <p className="mt-2 max-h-40 overflow-y-auto text-sm leading-relaxed text-slate-100">
                {mapping.angel.psalmText}
              </p>
            </div>
          </DetailSection>

          <DetailSection title="Virtude / Vício">
            <FieldRow label="Virtude" value={goldenDawn.virtue} />
            <FieldRow label="Vício" value={goldenDawn.vice} />
          </DetailSection>

          <section className="space-y-2 rounded-xl border border-white/5 bg-gold-500/5 px-3 py-3 pb-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold-200 font-bold">Experiência Espiritual</p>
            <p className="text-sm leading-relaxed text-slate-100">{goldenDawn.spiritualExperience}</p>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
