import React, { useEffect, useMemo, useState } from 'react';
import { PRACTICE_SETS, SetId } from './data/reviewSets';
import {
  AllSetsProgress,
  createEmptyReflection,
  createEmptySetProgress,
  ReflectionState,
  SetUserProgress,
} from './types/progress';
import {
  Question1View,
  Question2View,
  Question3View,
  Question4View,
  Question5View,
} from './components/QuestionViews';
import { HomeworkReflectionView } from './components/HomeworkReflectionView';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type ActiveSection = 'exam' | 'reflection';

const STORAGE_KEY = 'unit3-stoichiometry-review-v3';
const REFLECTION_STORAGE_KEY = 'unit3-stoichiometry-reflection-v2';

const STEP_LABELS = [
  '1. Error Analysis',
  '2. Mole Ratios',
  '3. Conservation',
  '4. Particulate',
  '5. Limiting Reactant',
  '6. Reflection',
];

function loadInitialProgress(): AllSetsProgress {
  const defaults: AllSetsProgress = {
    A: createEmptySetProgress(),
    B: createEmptySetProgress(),
    C: createEmptySetProgress(),
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AllSetsProgress>;
    return {
      A: { ...defaults.A, ...(parsed.A || {}) },
      B: { ...defaults.B, ...(parsed.B || {}) },
      C: { ...defaults.C, ...(parsed.C || {}) },
    };
  } catch {
    return defaults;
  }
}

function loadInitialReflection(): ReflectionState {
  const defaults = createEmptyReflection();
  try {
    const raw = localStorage.getItem(REFLECTION_STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export default function App() {
  const [section, setSection] = useState<ActiveSection>('exam');
  const [activeSetId, setActiveSetId] = useState<SetId>('A');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [allProgress, setAllProgress] = useState<AllSetsProgress>(loadInitialProgress);
  const [reflection, setReflection] = useState<ReflectionState>(loadInitialReflection);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    } catch {
      // Ignore storage quota errors
    }
  }, [allProgress]);

  useEffect(() => {
    try {
      localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(reflection));
    } catch {
      // Ignore storage quota errors
    }
  }, [reflection]);

  const currentSet = PRACTICE_SETS[activeSetId];
  const currentProgress = allProgress[activeSetId];

  const updateCurrentProgress = (updater: (prev: SetUserProgress) => SetUserProgress) => {
    setAllProgress((prev) => ({
      ...prev,
      [activeSetId]: updater(prev[activeSetId]),
    }));
  };

  const handleResetSet = () => {
    setAllProgress((prev) => ({
      ...prev,
      [activeSetId]: createEmptySetProgress(),
    }));
  };

  const submittedCount = useMemo(() => {
    return [
      currentProgress.q1.submitted,
      currentProgress.q2.submitted,
      currentProgress.q3.submitted,
      currentProgress.q4.submitted,
      currentProgress.q5.submitted,
    ].filter(Boolean).length;
  }, [currentProgress]);

  const handleSelectStep = (idx: number) => {
    if (idx === 5) {
      setSection('reflection');
    } else {
      setQuestionIndex(idx);
      setSection('exam');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setSection('exam');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Unit 3 Chemistry Review
          </a>

          {/* Zone 2: Clean single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {(
              [
                ['exam', 'Practice Exam'],
                ['reflection', 'Reflection'],
              ] as const
            ).map(([key, label]) => {
              const active = section === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                    active
                      ? 'text-slate-900 border-sky-700'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleResetSet}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Set {activeSetId}
            </button>
          </div>
        </div>

        {/* Mobile Nav Strip */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-slate-600">
          {(
            [
              ['exam', 'Practice Exam'],
              ['reflection', 'Reflection'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`py-1 whitespace-nowrap shrink-0 cursor-pointer ${
                section === key ? 'text-sky-800 font-semibold underline underline-offset-4' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Practice Set Toolbar */}
        <section className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Stoichiometry &amp; Limiting Reactants</span>
              <span aria-hidden="true">·</span>
              <span>{currentSet.name}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{submittedCount} of 5 sections submitted</span>
            </div>
            <p className="text-sm text-slate-700">{currentSet.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['A', 'B', 'C'] as SetId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSetId(id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSetId === id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Set {id}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section Stepper */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEP_LABELS.map((label, idx) => {
            const isReflectionStep = idx === 5;
            const isActive = isReflectionStep
              ? section === 'reflection'
              : section === 'exam' && questionIndex === idx;
            const isDone = isReflectionStep
              ? reflection.submitted
              : [
                  currentProgress.q1.submitted,
                  currentProgress.q2.submitted,
                  currentProgress.q3.submitted,
                  currentProgress.q4.submitted,
                  currentProgress.q5.submitted,
                ][idx];
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900'
                    : isDone
                      ? 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* PRACTICE EXAM */}
        {section === 'exam' && (
          <div className="space-y-6">
            {questionIndex === 0 && (
              <Question1View
                data={currentSet.q1}
                state={currentProgress.q1}
                onChange={(next) =>
                  updateCurrentProgress((prev) => ({ ...prev, q1: next }))
                }
              />
            )}
            {questionIndex === 1 && (
              <Question2View
                data={currentSet.q2}
                state={currentProgress.q2}
                onChange={(next) =>
                  updateCurrentProgress((prev) => ({ ...prev, q2: next }))
                }
              />
            )}
            {questionIndex === 2 && (
              <Question3View
                data={currentSet.q3}
                state={currentProgress.q3}
                onChange={(next) =>
                  updateCurrentProgress((prev) => ({ ...prev, q3: next }))
                }
              />
            )}
            {questionIndex === 3 && (
              <Question4View
                data={currentSet.q4}
                state={currentProgress.q4}
                onChange={(next) =>
                  updateCurrentProgress((prev) => ({ ...prev, q4: next }))
                }
              />
            )}
            {questionIndex === 4 && (
              <Question5View
                data={currentSet.q5}
                state={currentProgress.q5}
                onChange={(next) =>
                  updateCurrentProgress((prev) => ({ ...prev, q5: next }))
                }
              />
            )}

            {/* Bottom Problem Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={questionIndex === 0}
                onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Section
              </button>

              {questionIndex < 4 ? (
                <button
                  type="button"
                  onClick={() => setQuestionIndex((i) => Math.min(4, i + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Next Section
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSection('reflection')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-sky-700 text-white rounded-lg hover:bg-sky-800 cursor-pointer"
                >
                  Homework Reflection
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* HOMEWORK REFLECTION & PDF DOWNLOAD */}
        {section === 'reflection' && (
          <HomeworkReflectionView
            activeSetId={activeSetId}
            progress={currentProgress}
            state={reflection}
            onChange={setReflection}
            onBackToExam={() => {
              setQuestionIndex(4);
              setSection('exam');
            }}
          />
        )}
      </main>
    </div>
  );
}
