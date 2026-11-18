import React from 'react';
import { ParticleKind } from '../data/reviewSets';

interface MoleculeGlyphProps {
  kind: ParticleKind;
  x: number;
  y: number;
  highlightError?: boolean;
}

const DarkAtom = ({ cx, cy, r = 8.5 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#0f172a" strokeWidth={1.5} />
);

const LightAtom = ({ cx, cy, r = 8.5 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke="#0f172a" strokeWidth={1.75} />
);

export const MoleculeGlyph: React.FC<MoleculeGlyphProps> = ({ kind, x, y, highlightError }) => {
  const renderAtoms = () => {
    switch (kind) {
      // Single metal atoms
      case 'Mg_atom':
      case 'Li_atom':
        return <DarkAtom cx={0} cy={0} r={8.5} />;

      // Separated nonmetal error atoms
      case 'O_atom':
      case 'N_atom':
        return <LightAtom cx={0} cy={0} r={8.5} />;

      // Diatomic gas molecules
      case 'O2':
      case 'N2':
        return (
          <>
            <LightAtom cx={-8.5} cy={0} r={8.5} />
            <LightAtom cx={8.5} cy={0} r={8.5} />
          </>
        );

      // 1:1 Solid unit: MgO
      case 'MgO_solid':
        return (
          <>
            <rect
              x={-20}
              y={-13}
              width={40}
              height={26}
              rx={5}
              fill="#e2e8f0"
              fillOpacity={0.55}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <DarkAtom cx={-8.5} cy={0} r={8} />
            <LightAtom cx={8.5} cy={0} r={8} />
          </>
        );

      // 2:1 Solid unit: Li2O
      case 'Li2O_solid':
        return (
          <>
            <rect
              x={-27}
              y={-13}
              width={54}
              height={26}
              rx={5}
              fill="#e2e8f0"
              fillOpacity={0.55}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <DarkAtom cx={-15.5} cy={0} r={7} />
            <LightAtom cx={0} cy={0} r={7.5} />
            <DarkAtom cx={15.5} cy={0} r={7} />
          </>
        );

      // 3:2 Solid unit: Mg3N2
      case 'Mg3N2_solid':
        return (
          <>
            <rect
              x={-28}
              y={-19}
              width={56}
              height={38}
              rx={6}
              fill="#e2e8f0"
              fillOpacity={0.55}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <DarkAtom cx={-15} cy={-7} r={7} />
            <LightAtom cx={0} cy={-7} r={7} />
            <DarkAtom cx={15} cy={-7} r={7} />
            <LightAtom cx={-8} cy={8} r={7} />
            <DarkAtom cx={8} cy={8} r={7} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <g transform={`translate(${x}, ${y})`}>
      {highlightError && (
        <circle
          cx={0}
          cy={0}
          r={20}
          fill="rgba(220, 38, 38, 0.08)"
          stroke="#dc2626"
          strokeWidth={1.75}
          strokeDasharray="4 3"
        />
      )}
      {renderAtoms()}
    </g>
  );
};

interface ParticleBoxProps {
  title: string;
  particles: { kind: ParticleKind; count: number }[];
  highlightSingleAtoms?: boolean;
  onClick?: () => void;
  interactiveBadge?: string;
  emptyMessage?: string;
}

const SLOT_COORDS: [number, number][] = [
  [52, 40],
  [124, 40],
  [196, 40],
  [268, 40],
  [52, 95],
  [124, 95],
  [196, 95],
  [268, 95],
  [52, 150],
  [124, 150],
  [196, 150],
  [268, 150],
];

export const ParticleBox: React.FC<ParticleBoxProps> = ({
  title,
  particles,
  highlightSingleAtoms = false,
  onClick,
  interactiveBadge,
  emptyMessage = 'Use the + buttons to add solid product units and excess particles',
}) => {
  const expanded: ParticleKind[] = [];
  for (const item of particles) {
    for (let i = 0; i < item.count; i++) {
      expanded.push(item.kind);
    }
  }

  return (
    <div
      onClick={onClick}
      className={`border rounded-xl bg-white p-3 transition-colors ${
        onClick ? 'cursor-pointer hover:border-sky-400 border-slate-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        {interactiveBadge ? (
          <span className="text-xs font-medium text-rose-700">{interactiveBadge}</span>
        ) : (
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
            {expanded.length} particles
          </span>
        )}
      </div>
      <svg
        viewBox="0 0 320 190"
        className="w-full h-auto bg-slate-50 border border-slate-200 rounded-lg"
        role="img"
        aria-label={title}
      >
        {expanded.length === 0 ? (
          <text
            x="160"
            y="95"
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
            fontFamily="DM Sans, sans-serif"
          >
            {emptyMessage}
          </text>
        ) : (
          expanded.map((kind, idx) => {
            const [x, y] = SLOT_COORDS[idx % SLOT_COORDS.length];
            const isErrorAtom = kind === 'O_atom' || kind === 'N_atom';
            return (
              <MoleculeGlyph
                key={`${kind}-${idx}`}
                kind={kind}
                x={x}
                y={y}
                highlightError={highlightSingleAtoms && isErrorAtom}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
