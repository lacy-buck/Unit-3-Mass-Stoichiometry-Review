import React from 'react';
import { jsPDF } from 'jspdf';
import { SetId } from '../data/reviewSets';
import { ReflectionState, SetUserProgress } from '../types/progress';
import { CheckCircle2, FileDown } from 'lucide-react';

interface HomeworkReflectionViewProps {
  activeSetId: SetId;
  progress: SetUserProgress;
  state: ReflectionState;
  onChange: (next: ReflectionState) => void;
  onBackToExam: () => void;
}

const COMMON_MISTAKE_OPTIONS = [
  'Flipping the mole ratio upside down in dimensional analysis',
  'Multiplying molar mass by the equation coefficient',
  'Forgetting to balance the chemical equation before converting moles',
  'Comparing reactant grams directly instead of converting to moles first',
  'Breaking excess diatomic molecules into single atoms in particulate boxes',
  'Forgetting to subtract consumed moles from initial moles for excess reagent',
];

function downloadReflectionPdf(
  state: ReflectionState,
  activeSetId: SetId,
  progress: SetUserProgress
) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 52;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  let y = 56;

  const addWrappedText = (text: string, fontSize: number, bold = false, spacing = 16) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text || '—', maxLineWidth);
    for (const line of lines) {
      if (y > 740) {
        doc.addPage();
        y = 56;
      }
      doc.text(line, margin, y);
      y += fontSize * 1.4;
    }
    y += spacing - fontSize * 0.4;
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Unit 3 Chemistry Review — Reflection', margin, y);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const studentDisplay = state.studentName.trim() || 'Not entered';
  const dateDisplay = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Student Name: ${studentDisplay}`, margin, y);
  doc.text(`Date: ${dateDisplay}`, pageWidth - margin - 130, y);
  y += 18;

  const completedSections = [
    progress.q1.submitted ? '1' : null,
    progress.q2.submitted ? '2' : null,
    progress.q3.submitted ? '3' : null,
    progress.q4.submitted ? '4' : null,
    progress.q5.submitted ? '5' : null,
  ].filter(Boolean);

  doc.text(
    `Practice Set: Set ${activeSetId}   |   Submitted Sections: ${
      completedSections.length > 0 ? completedSections.join(', ') : 'None yet'
    }`,
    margin,
    y
  );
  y += 16;

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 26;

  // Question 1 (Error Pattern)
  addWrappedText('1. Mistake That Tripped Me Up Most / Requires Attention', 12, true, 10);
  addWrappedText(state.commonMistake || 'No selection made', 11, false, 20);

  // Question 2 (Written Reflection)
  addWrappedText('2. Written Reflection', 12, true, 12);

  addWrappedText(
    'What is one concept from Unit 3 that clicked more clearly during this review, and why?',
    11,
    true,
    8
  );
  addWrappedText(state.strongestTakeaway.trim() || 'No response entered.', 11, false, 18);

  addWrappedText(
    'What specific check will you perform on test day to prevent careless stoichiometry errors?',
    11,
    true,
    8
  );
  addWrappedText(state.testDayStrategy.trim() || 'No response entered.', 11, false, 20);

  const safeName = state.studentName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  const filename = safeName
    ? `Unit3_Reflection_${safeName}.pdf`
    : `Unit3_Reflection_Set_${activeSetId}.pdf`;

  doc.save(filename);
}

export const HomeworkReflectionView: React.FC<HomeworkReflectionViewProps> = ({
  activeSetId,
  progress,
  state,
  onChange,
  onBackToExam,
}) => {
  const canSubmit =
    Boolean(state.commonMistake) &&
    state.strongestTakeaway.trim().length > 0 &&
    state.testDayStrategy.trim().length > 0;

  const handleSubmitAndDownload = () => {
    const nextState = { ...state, submitted: true };
    onChange(nextState);
    downloadReflectionPdf(nextState, activeSetId, progress);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="text-xs text-slate-500 font-medium">
          End-of-Review Turn-In · Unit 3 Test Preparation
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Homework Reflection
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Complete the reflection below and submit to download a PDF summary to turn in.
        </p>
      </div>

      {/* Student Name for PDF Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
        <label htmlFor="ref-student-name" className="block text-sm font-semibold text-slate-900">
          Student Name (appears on your downloaded PDF)
        </label>
        <input
          id="ref-student-name"
          type="text"
          value={state.studentName}
          onChange={(e) => onChange({ ...state, studentName: e.target.value })}
          placeholder="First and Last Name"
          className="w-full sm:w-80 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white focus:outline-none"
        />
      </div>

      {/* 1. Most Common Error Pattern */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          1. Which mistake tripped you up most (or requires your closest attention)?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {COMMON_MISTAKE_OPTIONS.map((opt) => {
            const selected = state.commonMistake === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ...state, commonMistake: opt })}
                className={`p-3 rounded-lg border text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                  selected
                    ? 'bg-sky-50 border-sky-700 text-sky-950 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Written Reflection Prompts */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">2. Written Reflection</h2>

        <div className="space-y-1.5">
          <label htmlFor="ref-takeaway" className="block text-xs font-medium text-slate-700">
            What is one concept from Unit 3 that clicked more clearly during this review, and why?
          </label>
          <textarea
            id="ref-takeaway"
            rows={3}
            value={state.strongestTakeaway}
            onChange={(e) => onChange({ ...state, strongestTakeaway: e.target.value })}
            placeholder="Describe what you now understand better..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ref-strategy" className="block text-xs font-medium text-slate-700">
            What specific check will you perform on test day to prevent careless stoichiometry errors?
          </label>
          <textarea
            id="ref-strategy"
            rows={3}
            value={state.testDayStrategy}
            onChange={(e) => onChange({ ...state, testDayStrategy: e.target.value })}
            placeholder="Write your concrete test-day verification habit..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToExam}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Back to Practice Problems
          </button>

          <button
            type="button"
            onClick={handleSubmitAndDownload}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Submit &amp; Download PDF
          </button>
        </div>

        {state.submitted && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
              canSubmit
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              {canSubmit ? (
                <div className="font-semibold">
                  Reflection PDF downloaded! You can now turn it in.
                </div>
              ) : (
                <div>
                  PDF downloaded, though please make sure you selected a mistake and completed both
                  reflection boxes before turning it in.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
