import React, { useState } from 'react';
import {
  McqItem,
  ParticleKind,
  Question1Data,
  Question2Data,
  Question3Data,
  Question4Data,
  Question5Data,
} from '../data/reviewSets';
import {
  Q1UserState,
  Q2UserState,
  Q3UserState,
  Q4UserState,
  Q5UserState,
} from '../types/progress';
import { ParticleBox } from './ParticulateDiagram';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';

function approxEqual(input: string, target: number, tol: number): boolean {
  const num = parseFloat(input.trim());
  if (!Number.isFinite(num)) return false;
  return Math.abs(num - target) <= tol;
}

const StatusFeedback: React.FC<{ ok: boolean; okText: string; errText: string }> = ({
  ok,
  okText,
  errText,
}) => (
  <div
    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
      ok ? 'text-emerald-700' : 'text-rose-700'
    }`}
  >
    {ok ? (
      <CheckCircle2 className="w-4 h-4 shrink-0" />
    ) : (
      <AlertTriangle className="w-4 h-4 shrink-0" />
    )}
    <span>{ok ? okText : errText}</span>
  </div>
);

const McqBlock: React.FC<{
  item: McqItem;
  selectedIndex: number | undefined;
  submitted: boolean;
  onSelect: (idx: number) => void;
}> = ({ item, selectedIndex, submitted, onSelect }) => {
  const isCorrect = selectedIndex === item.correctIndex;
  return (
    <div className="space-y-3">
      <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
        {item.question}
      </p>
      <div className="space-y-2">
        {item.options.map((opt, idx) => {
          const chosen = selectedIndex === idx;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(idx)}
              className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-colors cursor-pointer flex items-start gap-2.5 ${
                chosen
                  ? 'bg-sky-50 border-sky-700 text-sky-950 font-medium'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono shrink-0 mt-0.5 ${
                  chosen
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-white text-slate-500 border-slate-300'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="pt-1">
          <StatusFeedback
            ok={isCorrect}
            okText={item.feedbackCorrect}
            errText={
              selectedIndex === undefined
                ? 'Select an option before submitting.'
                : item.feedbackIncorrect
            }
          />
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * SECTION 1: Stoichiometry Error Analysis & Railroad Builder
 * ========================================================================== */
export const Question1View: React.FC<{
  data: Question1Data;
  state: Q1UserState;
  onChange: (next: Q1UserState) => void;
  onSubmitAttempt?: () => void;
}> = ({ data, state, onChange, onSubmitAttempt }) => {
  const [showHint, setShowHint] = useState(false);

  const toggleFlag = (id: string) => {
    const exists = state.flaggedIds.includes(id);
    const nextFlags = exists
      ? state.flaggedIds.filter((x) => x !== id)
      : [...state.flaggedIds, id];
    onChange({ ...state, flaggedIds: nextFlags });
  };

  const auditItems = [data.flawedEquation, ...data.flawedTrack];
  const coreErrorsCount = auditItems.filter((item) => item.isError).length;
  const allCoreErrorsSpotted = auditItems.every((item) =>
    item.isError
      ? state.flaggedIds.includes(item.id)
      : !state.flaggedIds.includes(item.id)
  );

  const coeffsCorrect = data.equationParts.correctCoeffs.every(
    (c, idx) => parseInt(state.coeffs[idx] || '0', 10) === c
  );

  const trackCorrect =
    state.step1Num === data.trackCorrectionOptions.correctStep1Num &&
    state.step1Den === data.trackCorrectionOptions.correctStep1Den &&
    state.step2Num === data.trackCorrectionOptions.correctStep2Num &&
    state.step2Den === data.trackCorrectionOptions.correctStep2Den &&
    state.step3Num === data.trackCorrectionOptions.correctStep3Num &&
    state.step3Den === data.trackCorrectionOptions.correctStep3Den;

  const massCorrect = approxEqual(state.finalMass, data.correctMass, data.tolerance);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 font-medium">{data.skillFocus}</div>
          <h2 className="text-xl font-semibold text-slate-900">{data.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showHint ? 'Hide Hint' : 'Strategy Hint'}
        </button>
      </div>

      {showHint && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-950 space-y-1">
          <p className="font-medium">How to audit a dimensional analysis table:</p>
          <p className="text-xs leading-relaxed text-sky-900">
            1) Count atoms of every element on both sides of the chemical equation first. 2) Trace
            units diagonally across the railroad track: the denominator of each step must cancel
            the numerator of the previous step. 3) Remember molar mass is always grams per{' '}
            <strong>1 mole</strong>, never multiplied by the equation coefficient.
          </p>
        </div>
      )}

      {/* Prompt & Flawed Student Work */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
          <span className="font-semibold text-slate-900">Problem: </span>
          {data.prompt}
        </p>

        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Step A: Click the {coreErrorsCount}{' '}
              {coreErrorsCount === 1 ? 'mistake' : 'mistakes'} in the student’s equation or
              dimensional analysis work below
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {state.flaggedIds.length} selected
            </span>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => toggleFlag(data.flawedEquation.id)}
              className={`px-4 py-2 rounded-xl chem-eq text-sm sm:text-base font-semibold transition-all cursor-pointer border-2 ${
                state.flaggedIds.includes(data.flawedEquation.id)
                  ? 'border-rose-600 bg-rose-50 text-rose-900 border-dashed'
                  : 'border-transparent bg-white hover:border-slate-300 text-slate-900'
              }`}
            >
              {data.flawedEquation.display}
            </button>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="inline-flex items-center min-w-full justify-center gap-0">
              {data.flawedTrack.map((seg, idx) => {
                const flagged = state.flaggedIds.includes(seg.id);
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => toggleFlag(seg.id)}
                    className={`group flex flex-col items-stretch px-3 py-2 text-center transition-all cursor-pointer min-w-[130px] border-r border-slate-400 last:border-r-0 rounded-lg ${
                      flagged
                        ? 'ring-2 ring-rose-600 ring-offset-1 bg-rose-50/90'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="chem-eq text-xs sm:text-sm font-medium text-slate-900 pb-1.5 border-b border-slate-800 whitespace-nowrap">
                      {seg.numerator}
                    </div>
                    <div className="chem-eq text-xs sm:text-sm text-slate-700 pt-1.5 min-h-[26px] whitespace-nowrap">
                      {seg.denominator || (idx === 0 ? '—' : '')}
                    </div>
                  </button>
                );
              })}

              <span className="ml-2 px-3 py-2 chem-eq text-sm font-semibold whitespace-nowrap text-slate-900">
                {data.flawedResult.display}
              </span>
            </div>
          </div>

          {state.submitted && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <StatusFeedback
                ok={allCoreErrorsSpotted}
                okText={`You spotted ${coreErrorsCount === 1 ? 'the mistake' : `all ${coreErrorsCount} mistakes`} without flagging valid steps!`}
                errText={`Flag only the ${coreErrorsCount} ${coreErrorsCount === 1 ? 'mistake' : 'mistakes'} in the equation and conversion track above.`}
              />
              <div className="grid gap-1.5 text-xs">
                {auditItems.map((item) => {
                  const userFlagged = state.flaggedIds.includes(item.id);
                  if (!userFlagged && !item.isError) return null;
                  return (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border ${
                        item.isError && userFlagged
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : item.isError && !userFlagged
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <span className="font-semibold">
                        {item.isError
                          ? userFlagged
                            ? 'Caught Error: '
                            : 'Missed Error: '
                          : 'Actually Valid: '}
                      </span>
                      {item.errorFeedback || 'This step was set up properly.'}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step B: Correct the Work */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Step B: Correct the Equation, Dimensional Analysis Track, and Final Mass
        </h3>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600">
            1. Enter the balanced chemical equation coefficients (use 1 if implicit):
          </label>
          <div className="flex flex-wrap items-center gap-2 chem-eq text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-lg p-3">
            <input
              type="number"
              min={1}
              max={30}
              value={state.coeffs[0]}
              onChange={(e) => {
                const next = [...state.coeffs] as [string, string, string, string];
                next[0] = e.target.value;
                onChange({ ...state, coeffs: next });
              }}
              aria-label={`Coefficient for ${data.equationParts.reactant1}`}
              className="w-14 px-2 py-1 text-center font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
            <span>{data.equationParts.reactant1}</span>
            <span>+</span>
            <input
              type="number"
              min={1}
              max={30}
              value={state.coeffs[1]}
              onChange={(e) => {
                const next = [...state.coeffs] as [string, string, string, string];
                next[1] = e.target.value;
                onChange({ ...state, coeffs: next });
              }}
              aria-label={`Coefficient for ${data.equationParts.reactant2}`}
              className="w-14 px-2 py-1 text-center font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
            <span>{data.equationParts.reactant2}</span>
            <span>→</span>
            <input
              type="number"
              min={1}
              max={30}
              value={state.coeffs[2]}
              onChange={(e) => {
                const next = [...state.coeffs] as [string, string, string, string];
                next[2] = e.target.value;
                onChange({ ...state, coeffs: next });
              }}
              aria-label={`Coefficient for ${data.equationParts.product1}`}
              className="w-14 px-2 py-1 text-center font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
            <span>{data.equationParts.product1}</span>
            <span>+</span>
            <input
              type="number"
              min={1}
              max={30}
              value={state.coeffs[3]}
              onChange={(e) => {
                const next = [...state.coeffs] as [string, string, string, string];
                next[3] = e.target.value;
                onChange({ ...state, coeffs: next });
              }}
              aria-label={`Coefficient for ${data.equationParts.product2}`}
              className="w-14 px-2 py-1 text-center font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
            <span>{data.equationParts.product2}</span>
          </div>
          {state.submitted && (
            <StatusFeedback
              ok={coeffsCorrect}
              okText="Equation coefficients are balanced."
              errText="Recount the atoms of every element on both sides of your equation."
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600">
            2. Build the corrected dimensional analysis track:
          </label>
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex items-stretch gap-2 min-w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex flex-col justify-center px-3 py-2 bg-white border border-slate-200 rounded-lg min-w-[125px] text-center">
                <span className="text-[11px] text-slate-400 mb-1">Given</span>
                <span className="chem-eq text-xs sm:text-sm font-semibold text-slate-900">
                  {data.trackCorrectionOptions.givenDisplay}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[155px] bg-white border border-slate-200 rounded-lg p-2">
                <select
                  value={state.step1Num}
                  onChange={(e) => onChange({ ...state, step1Num: e.target.value })}
                  aria-label="Step 1 numerator"
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                >
                  <option value="">Select numerator...</option>
                  {data.trackCorrectionOptions.step1NumOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="border-t border-slate-800" />
                <select
                  value={state.step1Den}
                  onChange={(e) => onChange({ ...state, step1Den: e.target.value })}
                  aria-label="Step 1 denominator"
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                >
                  <option value="">Select denominator...</option>
                  {data.trackCorrectionOptions.step1DenOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[155px] bg-white border border-slate-200 rounded-lg p-2">
                <select
                  value={state.step2Num}
                  onChange={(e) => onChange({ ...state, step2Num: e.target.value })}
                  aria-label="Step 2 numerator"
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                >
                  <option value="">Select numerator...</option>
                  {data.trackCorrectionOptions.step2NumOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="border-t border-slate-800" />
                <select
                  value={state.step2Den}
                  onChange={(e) => onChange({ ...state, step2Den: e.target.value })}
                  aria-label="Step 2 denominator"
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                >
                  <option value="">Select denominator...</option>
                  {data.trackCorrectionOptions.step2DenOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[155px] bg-white border border-slate-200 rounded-lg p-2">
                <select
                  value={state.step3Num}
                  onChange={(e) => onChange({ ...state, step3Num: e.target.value })}
                  aria-label="Step 3 numerator"
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                >
                  <option value="">Select numerator...</option>
                  {data.trackCorrectionOptions.step3NumOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="border-t border-slate-800" />
                <select
                  value={state.step3Den}
                  onChange={(e) => onChange({ ...state, step3Den: e.target.value })}
                  aria-label="Step 3 denominator"
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5"
                >
                  <option value="">Select denominator...</option>
                  {data.trackCorrectionOptions.step3DenOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {state.submitted && (
            <StatusFeedback
              ok={trackCorrect}
              okText="Dimensional analysis conversion factors cancel cleanly."
              errText="Check unit cancellation—ensure each denominator cancels the previous numerator and molar mass is per 1 mole."
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="q1-final-mass" className="block text-xs font-medium text-slate-600">
            3. Final calculated mass ({data.targetUnit}):
          </label>
          <div className="flex items-center gap-2">
            <input
              id="q1-final-mass"
              type="number"
              step="0.01"
              value={state.finalMass}
              onChange={(e) => onChange({ ...state, finalMass: e.target.value })}
              placeholder="0.00"
              className="w-36 px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white focus:outline-none"
            />
            <span className="chem-eq text-sm text-slate-700">{data.targetUnit}</span>
          </div>
          {state.submitted && (
            <StatusFeedback
              ok={massCorrect}
              okText="Final calculated mass is accurate!"
              errText="Recalculate using your corrected dimensional analysis track."
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onSubmitAttempt?.();
              onChange({ ...state, submitted: true });
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Submit Section 2
          </button>
          {state.submitted && (
            <span className="text-xs text-slate-600">Section 2 checked</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SECTION 2: Qualitative Mole Ratio & Molar Mass Prediction (No Calculations)
 * ========================================================================== */
export const Question2View: React.FC<{
  data: Question2Data;
  state: Q2UserState;
  onChange: (next: Q2UserState) => void;
  onSubmitAttempt?: () => void;
}> = ({ data, state, onChange, onSubmitAttempt }) => {
  const [showHint, setShowHint] = useState(false);

  const predictionOk = state.prediction === data.expectedPrediction;
  const ratioOk = state.moleRatioRelation === data.expectedMoleRatioRelation;
  const mmOk = state.molarMassRelation === data.expectedMolarMassRelation;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500 font-medium">{data.skillFocus}</div>
          <h2 className="text-xl font-semibold text-slate-900">{data.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showHint ? 'Hide Hint' : 'Strategy Hint'}
        </button>
      </div>

      {showHint && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-950">
          {data.predictionHint}
        </div>
      )}

      {/* Problem Statement */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{data.context}</p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-center chem-eq text-base sm:text-lg font-semibold text-slate-900">
          {data.equation}
        </div>
        <p className="text-sm sm:text-base font-medium text-slate-900">{data.prompt}</p>
      </div>

      {/* Qualitative Prediction Builder */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">
            1. Predict the Mass of the New Solid ({data.productSolid.symbol}) vs Reactant Solid (
            {data.reactantSolid.symbol})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                ['more', `More mass than ${data.reactantSolid.symbol}`],
                ['less', `Less mass than ${data.reactantSolid.symbol}`],
                ['same', `The same mass as ${data.reactantSolid.symbol}`],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ ...state, prediction: val })}
                className={`py-2.5 px-3 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                  state.prediction === val
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {state.submitted && (
            <StatusFeedback
              ok={predictionOk}
              okText="Your overall mass prediction is correct!"
              errText="Re-evaluate how mole ratio and molar mass combine to determine the product solid mass."
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              2. In terms of Mole Ratio ({data.productSolid.symbol} formed vs{' '}
              {data.reactantSolid.symbol} reacted):
            </label>
            <div className="space-y-2">
              {(
                [
                  [
                    'more_moles',
                    `More moles of ${data.productSolid.symbol} form than moles of ${data.reactantSolid.symbol} reacted`,
                  ],
                  [
                    'fewer_moles',
                    `Fewer moles of ${data.productSolid.symbol} form than moles of ${data.reactantSolid.symbol} reacted`,
                  ],
                  [
                    'equal_moles',
                    `Equal moles of ${data.productSolid.symbol} form per mole of ${data.reactantSolid.symbol} reacted`,
                  ],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange({ ...state, moleRatioRelation: val })}
                  className={`w-full text-left py-2 px-3 text-xs sm:text-sm rounded-lg border transition-colors cursor-pointer ${
                    state.moleRatioRelation === val
                      ? 'bg-sky-50 border-sky-700 text-sky-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {state.submitted && (
              <StatusFeedback
                ok={ratioOk}
                okText="Mole ratio comparison verified."
                errText="Look at the coefficients in the balanced equation."
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              3. In terms of Molar Mass (from your Periodic Table):
            </label>
            <div className="space-y-2">
              {(
                [
                  [
                    'greater_mm',
                    `${data.productSolid.symbol} has a greater molar mass (g/mol) than ${data.reactantSolid.symbol}`,
                  ],
                  [
                    'smaller_mm',
                    `${data.productSolid.symbol} has a smaller molar mass (g/mol) than ${data.reactantSolid.symbol}`,
                  ],
                  [
                    'equal_mm',
                    `${data.productSolid.symbol} and ${data.reactantSolid.symbol} have the same molar mass`,
                  ],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange({ ...state, molarMassRelation: val })}
                  className={`w-full text-left py-2 px-3 text-xs sm:text-sm rounded-lg border transition-colors cursor-pointer ${
                    state.molarMassRelation === val
                      ? 'bg-sky-50 border-sky-700 text-sky-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {state.submitted && (
              <StatusFeedback
                ok={mmOk}
                okText="Molar mass comparison verified."
                errText={`Check the atomic masses of ${data.productSolid.symbol} and ${data.reactantSolid.symbol} on your periodic table.`}
              />
            )}
          </div>
        </div>

        {/* Multiple-Choice Explanation */}
        <div className="pt-3 border-t border-slate-100">
          <McqBlock
            item={data.explanationMcq}
            selectedIndex={state.explanationChoice}
            submitted={state.submitted}
            onSelect={(idx) => onChange({ ...state, explanationChoice: idx })}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onSubmitAttempt?.();
              onChange({ ...state, submitted: true });
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Submit Section 4
          </button>
          {state.submitted && (
            <span className="text-xs text-slate-600">Section 4 checked</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SECTION 3: Conservation of Mass & Lab Errors — Multiple-Choice Series
 * ========================================================================== */
export const Question3View: React.FC<{
  data: Question3Data;
  state: Q3UserState;
  onChange: (next: Q3UserState) => void;
  onSubmitAttempt?: () => void;
}> = ({ data, state, onChange, onSubmitAttempt }) => {
  const correctCount = data.questions.filter(
    (q) => state.answers[q.id] === q.correctIndex
  ).length;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="text-xs text-slate-500 font-medium">{data.skillFocus}</div>
        <h2 className="text-xl font-semibold text-slate-900">{data.title}</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{data.context}</p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-center chem-eq text-base sm:text-lg font-semibold text-slate-900">
          {data.equation}
        </div>
      </div>

      <div className="space-y-4">
        {data.questions.map((mcq) => (
          <div key={mcq.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <McqBlock
              item={mcq}
              selectedIndex={state.answers[mcq.id]}
              submitted={state.submitted}
              onSelect={(idx) =>
                onChange({
                  ...state,
                  answers: { ...state.answers, [mcq.id]: idx },
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            onSubmitAttempt?.();
            onChange({ ...state, submitted: true });
          }}
          className="px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Submit Section 3
        </button>
        {state.submitted && (
          <span className="text-sm font-medium font-mono tabular-nums text-slate-700">
            Score: {correctCount} / {data.questions.length} correct
          </span>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * SECTION 4: Particulate Diagram — One Example (Atoms + Molecules → One Solid)
 * ========================================================================== */
export const Question4View: React.FC<{
  data: Question4Data;
  state: Q4UserState;
  onChange: (next: Q4UserState) => void;
  onSubmitAttempt?: () => void;
}> = ({ data, state, onChange, onSubmitAttempt }) => {
  const toggleFlagZone = (id: string) => {
    const exists = state.flaggedZoneIds.includes(id);
    const next = exists
      ? state.flaggedZoneIds.filter((x) => x !== id)
      : [...state.flaggedZoneIds, id];
    onChange({ ...state, flaggedZoneIds: next });
  };

  const adjustStamp = (kind: ParticleKind, delta: number) => {
    const current = state.builtCounts[kind] || 0;
    const nextVal = Math.max(0, Math.min(12, current + delta));
    onChange({
      ...state,
      builtCounts: {
        ...state.builtCounts,
        [kind]: nextVal,
      },
    });
  };

  const builtParticlesArray = Object.entries(state.builtCounts)
    .filter(([, cnt]) => (cnt || 0) > 0)
    .map(([kind, count]) => ({ kind: kind as ParticleKind, count: count! }));

  const errorsSpotted = data.studentAuditCards.every((card) =>
    card.isError ? state.flaggedZoneIds.includes(card.id) : !state.flaggedZoneIds.includes(card.id)
  );
  const diagramCorrect =
    data.availableStamps.every(
      (s) => (state.builtCounts[s.kind] || 0) === (data.correctAfterCounts[s.kind] || 0)
    ) && Object.values(state.builtCounts).reduce((a, b) => (a || 0) + (b || 0), 0) > 0;
  const limitingCorrect = state.limitingReactant === data.correctLimitingReactant;
  const countCorrect = parseInt(state.productCount || '0', 10) === data.correctProductCount;
  const excessCorrect = parseInt(state.excessCount || '-1', 10) === data.correctExcessCount;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="text-xs text-slate-500 font-medium">{data.skillFocus}</div>
        <h2 className="text-xl font-semibold text-slate-900">{data.title}</h2>
      </div>

      {/* Prompt & Student's Flawed Diagram */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-center chem-eq text-base font-semibold text-slate-900">
          {data.equation}
        </div>
        <p className="text-sm text-slate-800 leading-relaxed">{data.prompt}</p>

        {/* Key */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-900">Particle Key:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 inline-block" />
            {data.keyDescription.atomLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 inline-block" />
            {data.keyDescription.moleculeAtomLabel}
          </span>
          <span className="text-slate-500">
            Shaded rectangle = Solid product unit ({data.solidFormula})
          </span>
        </div>

        {/* Student's Flawed Work */}
        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Step A: Audit the student’s After Reaction sketch and answers below — click the 2
              mistakes to flag them
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {state.flaggedZoneIds.length} flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParticleBox
              title="Before Reaction (Atoms + Molecules)"
              particles={data.initialParticles}
            />
            <ParticleBox
              title="Student’s After Reaction Sketch"
              particles={data.flawedAfterParticles}
              highlightSingleAtoms={state.flaggedZoneIds.includes('err-atoms')}
              onClick={() => toggleFlagZone('err-atoms')}
              interactiveBadge={
                state.flaggedZoneIds.includes('err-atoms') ? 'Flagged' : 'Click to flag sketch'
              }
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600">
              Student’s Answers (click any answer that is incorrect):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {data.studentAuditCards.map((card) => {
                const selected = state.flaggedZoneIds.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleFlagZone(card.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-slate-500">
                      {card.promptLabel}
                    </div>
                    <div className="text-sm font-semibold chem-eq text-slate-900 mt-0.5">
                      {card.studentAnswer}
                    </div>
                    <div className="text-[11px] opacity-80 mt-1">
                      {selected ? 'Flagged as mistake' : 'Click to flag if wrong'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {state.submitted && (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <StatusFeedback
                ok={errorsSpotted}
                okText="Both student mistakes flagged!"
                errText="Flag only the 2 mistakes in the student's sketch and answers above."
              />
              <div className="grid gap-1.5 text-xs">
                {data.studentAuditCards.map((card) => {
                  const userFlagged = state.flaggedZoneIds.includes(card.id);
                  if (!userFlagged && !card.isError) return null;
                  return (
                    <div
                      key={card.id}
                      className={`p-2 rounded-lg border ${
                        card.isError && userFlagged
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : card.isError && !userFlagged
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <span className="font-semibold">
                        {card.isError
                          ? userFlagged
                            ? `Caught Error (${card.promptLabel}): `
                            : `Missed Error (${card.promptLabel}): `
                          : `Actually Valid (${card.promptLabel}): `}
                      </span>
                      {card.feedback}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Corrected Container Builder */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Step B: Build the Corrected "After Reaction" Container
            </h3>
            <p className="text-xs text-slate-500">
              Add the correct solid product units and any intact excess reactant particles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...state, builtCounts: {} })}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Container
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="space-y-2">
              {data.availableStamps.map((stamp) => {
                const count = state.builtCounts[stamp.kind] || 0;
                return (
                  <div
                    key={stamp.kind}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <span className="text-xs font-medium text-slate-800">{stamp.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustStamp(stamp.kind, -1)}
                        aria-label={`Remove ${stamp.formula}`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono tabular-nums text-sm font-semibold">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustStamp(stamp.kind, 1)}
                        aria-label={`Add ${stamp.formula}`}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Limiting Reactant:
                </label>
                <select
                  value={state.limitingReactant}
                  onChange={(e) => onChange({ ...state, limitingReactant: e.target.value })}
                  className="w-full px-2.5 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">Select...</option>
                  {data.limitingReactantOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  {data.solidFormula} Units Made:
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={state.productCount}
                  onChange={(e) => onChange({ ...state, productCount: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Excess {data.excessFormula} Remaining:
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={state.excessCount || ''}
                  onChange={(e) => onChange({ ...state, excessCount: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ParticleBox
              title="Your Corrected After Reaction Container"
              particles={builtParticlesArray}
            />
          </div>
        </div>

        {state.submitted && (
          <div className="flex flex-wrap gap-4 pt-1">
            <StatusFeedback
              ok={diagramCorrect}
              okText="Corrected particle container conserves all atoms & bonds!"
              errText="Recount atoms from the Before box—check solid product units and intact excess particles."
            />
            <StatusFeedback
              ok={limitingCorrect && countCorrect && excessCorrect}
              okText="Limiting reactant, product count, & excess particles correct."
              errText="Verify which reactant runs out first, total solid units made, and excess molecules left."
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onSubmitAttempt?.();
              onChange({ ...state, submitted: true });
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Submit Section 1
          </button>
          {state.submitted && (
            <span className="text-xs text-slate-600">Section 1 checked</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SECTION 5: Quantitative Limiting Reactant & Excess (Parts A, B, C)
 * ========================================================================== */
export const Question5View: React.FC<{
  data: Question5Data;
  state: Q5UserState;
  onChange: (next: Q5UserState) => void;
  onSubmitAttempt?: () => void;
}> = ({ data, state, onChange, onSubmitAttempt }) => {
  const r1Ok = approxEqual(state.molesR1, data.correctMolesR1, data.tolerance);
  const r2Ok = approxEqual(state.molesR2, data.correctMolesR2, data.tolerance);
  const limOk = state.limiting === data.correctLimiting;
  const maxProdOk = approxEqual(state.maxProductMoles, data.correctMaxProductMoles, data.tolerance);
  const excessOk = approxEqual(
    state.excessMolesRemaining,
    data.correctExcessMolesRemaining,
    data.tolerance
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="text-xs text-slate-500 font-medium">{data.skillFocus}</div>
        <h2 className="text-xl font-semibold text-slate-900">{data.title}</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{data.context}</p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-center chem-eq text-base sm:text-lg font-semibold text-slate-900">
          {data.equation}
        </div>
      </div>

      {/* Part A */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">{data.partAPrompt}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              Initial moles of {data.reactant1.formula} ({data.reactant1.massG} g):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={state.molesR1}
                onChange={(e) => onChange({ ...state, molesR1: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
              />
              <span className="text-xs font-mono text-slate-500">mol</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              Initial moles of {data.reactant2.formula} ({data.reactant2.massG} g):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={state.molesR2}
                onChange={(e) => onChange({ ...state, molesR2: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
              />
              <span className="text-xs font-mono text-slate-500">mol</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">
              Limiting Reactant:
            </label>
            <div className="flex gap-2">
              {[data.reactant1.formula, data.reactant2.formula].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onChange({ ...state, limiting: f })}
                  className={`flex-1 py-2 px-3 text-sm font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                    state.limiting === f
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {state.submitted && (
          <div className="flex flex-wrap gap-4">
            <StatusFeedback
              ok={r1Ok && r2Ok}
              okText="Initial mole conversions verified."
              errText="Recheck your mass-to-mole conversions using the given molar masses."
            />
            <StatusFeedback
              ok={limOk}
              okText="Limiting reactant is correct."
              errText="Compare available moles against the balanced mole ratio."
            />
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <McqBlock
            item={data.partAMcq}
            selectedIndex={state.partAChoice}
            submitted={state.submitted}
            onSelect={(idx) => onChange({ ...state, partAChoice: idx })}
          />
        </div>
      </div>

      {/* Part B */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">{data.partBPrompt}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            value={state.maxProductMoles}
            onChange={(e) => onChange({ ...state, maxProductMoles: e.target.value })}
            placeholder="0.00"
            aria-label={`Maximum moles of ${data.targetProduct.formula}`}
            className="w-36 px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
          />
          <span className="chem-eq text-sm text-slate-700">mol {data.targetProduct.formula}</span>
        </div>
        {state.submitted && (
          <StatusFeedback
            ok={maxProdOk}
            okText="Maximum product moles verified."
            errText="Multiply your limiting reactant moles by the mole ratio to the product."
          />
        )}
      </div>

      {/* Part C */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">{data.partCPrompt}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            value={state.excessMolesRemaining}
            onChange={(e) => onChange({ ...state, excessMolesRemaining: e.target.value })}
            placeholder="0.00"
            aria-label={`Excess moles of ${data.excessReactantFormula} remaining`}
            className="w-36 px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
          />
          <span className="chem-eq text-sm text-slate-700">mol {data.excessReactantFormula}</span>
        </div>
        {state.submitted && (
          <StatusFeedback
            ok={excessOk}
            okText="Excess moles remaining verified."
            errText="Subtract the moles consumed by the limiting reactant from initial moles of the excess reagent."
          />
        )}
      </div>

      {/* Submit Section 5 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            onSubmitAttempt?.();
            onChange({ ...state, submitted: true });
          }}
          className="px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Submit Section 5
        </button>
        {state.submitted && (
          <span className="text-xs text-slate-600">
            Section 5 checked · Proceed to Reflection
          </span>
        )}
      </div>
    </div>
  );
};
