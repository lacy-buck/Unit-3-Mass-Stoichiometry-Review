import React, { useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { PracticeSet, SetId } from '../data/reviewSets';
import { EngagementLog, ReflectionState, SetUserProgress } from '../types/progress';
import { evaluateSetPerformance, formatDuration, OverallPerformance } from '../utils/scoring';
import { CheckCircle2, FileDown } from 'lucide-react';

interface HomeworkReflectionViewProps {
  activeSetId: SetId;
  practiceSet: PracticeSet;
  progress: SetUserProgress;
  engagement: EngagementLog;
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
  performance: OverallPerformance
) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 52;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  let y = 52;

  const ensureSpace = (needed: number) => {
    if (y + needed > 745) {
      doc.addPage();
      y = 52;
    }
  };

  const addWrappedText = (text: string, fontSize: number, bold = false, spacing = 14) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text || '—', maxLineWidth);
    for (const line of lines) {
      ensureSpace(fontSize * 1.4);
      doc.text(line, margin, y);
      y += fontSize * 1.38;
    }
    y += spacing - fontSize * 0.38;
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text('Unit 3 Chemistry Review — Reflection & Engagement Log', margin, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  const studentDisplay = state.studentName.trim() || 'Not entered';
  const dateDisplay = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Student Name: ${studentDisplay}`, margin, y);
  doc.text(`Date: ${dateDisplay}`, pageWidth - margin - 130, y);
  y += 16;

  doc.text(
    `Practice Set: Set ${activeSetId}   |   Sections Checked: ${performance.submittedCount} / ${performance.sections.length}   |   Total Active Time: ${formatDuration(
      performance.totalTimeSec
    )}   |   Overall Accuracy: ${
      performance.overallPercent !== null
        ? `${performance.overallPercent}% (${performance.overallCorrect}/${performance.overallPossible})`
        : 'Not checked yet'
    }`,
    margin,
    y
  );
  y += 14;

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  // Student Engagement Log Table
  doc.setTextColor(15, 23, 42);
  addWrappedText('Student Engagement & Accuracy Log', 12, true, 10);

  const colX = {
    section: margin + 8,
    status: margin + 175,
    checks: margin + 260,
    time: margin + 325,
    accuracy: margin + 395,
  };

  ensureSpace(26);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 12, maxLineWidth, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Section', colX.section, y);
  doc.text('Status', colX.status, y);
  doc.text('Checks', colX.checks, y);
  doc.text('Time', colX.time, y);
  doc.text('Accuracy', colX.accuracy, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);

  for (const row of performance.sections) {
    ensureSpace(20);
    const checksDisplay = String(
      row.attempts > 0 ? row.attempts : row.submitted ? 1 : 0
    );
    const accuracyDisplay =
      row.percent !== null
        ? `${row.percent}% (${row.correctCount}/${row.totalCount})`
        : '—';

    doc.text(row.label, colX.section, y);
    doc.text(row.submitted ? 'Checked' : 'Not checked', colX.status, y);
    doc.text(checksDisplay, colX.checks, y);
    doc.text(formatDuration(row.timeSpentSec), colX.time, y);
    doc.text(accuracyDisplay, colX.accuracy, y);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);
    y += 18;
  }

  // Reflection time row
  ensureSpace(22);
  doc.setTextColor(71, 85, 105);
  doc.text('7. Reflection', colX.section, y);
  doc.text('Active', colX.status, y);
  doc.text('—', colX.checks, y);
  doc.text(formatDuration(performance.reflectionTimeSec), colX.time, y);
  doc.text('—', colX.accuracy, y);
  y += 24;

  // Reflection Q1
  doc.setTextColor(15, 23, 42);
  addWrappedText('1. Mistake That Tripped Me Up Most / Requires Attention', 12, true, 10);
  addWrappedText(state.commonMistake || 'No selection made', 10.5, false, 18);

  // Reflection Q2
  addWrappedText('2. Written Reflection', 12, true, 10);

  addWrappedText(
    'What is one concept from Unit 3 that clicked more clearly during this review, and why?',
    10.5,
    true,
    8
  );
  addWrappedText(state.strongestTakeaway.trim() || 'No response entered.', 10.5, false, 16);

  addWrappedText(
    'What specific check will you perform on test day to prevent careless stoichiometry errors?',
    10.5,
    true,
    8
  );
  addWrappedText(state.testDayStrategy.trim() || 'No response entered.', 10.5, false, 18);

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
  practiceSet,
  progress,
  engagement,
  state,
  onChange,
  onBackToExam,
}) => {
  const performance = useMemo(
    () => evaluateSetPerformance(practiceSet, progress, engagement),
    [practiceSet, progress, engagement]
  );

  const isComplete =
    Boolean(state.commonMistake) &&
    state.strongestTakeaway.trim().length > 0 &&
    state.testDayStrategy.trim().length > 0;

  const handleDownload = () => {
    const nextState = { ...state, submitted: true };
    onChange(nextState);
    downloadReflectionPdf(nextState, activeSetId, performance);
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
          Review your engagement log, complete the reflection below, and download a PDF summary to
          turn in.
        </p>
      </div>

      {/* Student Engagement & Performance Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Student Engagement Log (Set {activeSetId})
          </h2>
          <span className="text-xs text-slate-500">
            Included automatically in your downloaded PDF
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div className="text-xs text-slate-500">Total Active Time</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatDuration(performance.totalTimeSec)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div className="text-xs text-slate-500">Sections Checked</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
              {performance.submittedCount} / {performance.sections.length}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div className="text-xs text-slate-500">Overall Accuracy</div>
            <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
              {performance.overallPercent !== null
                ? `${performance.overallPercent}% (${performance.overallCorrect}/${performance.overallPossible})`
                : '—'}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Checks</th>
                <th className="py-2.5 px-3 text-right">Time</th>
                <th className="py-2.5 px-3 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performance.sections.map((row) => {
                const checks = row.attempts > 0 ? row.attempts : row.submitted ? 1 : 0;
                return (
                  <tr key={row.key} className="text-slate-800">
                    <td className="py-2.5 px-3 font-medium">{row.label}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={
                          row.submitted ? 'text-emerald-700 font-medium' : 'text-slate-400'
                        }
                      >
                        {row.submitted ? 'Checked' : 'Not checked'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {checks}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatDuration(row.timeSpentSec)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium">
                      {row.percent !== null
                        ? `${row.percent}% (${row.correctCount}/${row.totalCount})`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
              <tr className="text-slate-600 bg-slate-50/50">
                <td className="py-2.5 px-3 font-medium">7. Reflection</td>
                <td className="py-2.5 px-3">In progress</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">—</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {formatDuration(performance.reflectionTimeSec)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">—</td>
              </tr>
            </tbody>
          </table>
        </div>
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
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {state.submitted && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
              isComplete
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              {isComplete ? (
                <div className="font-semibold">
                  Reflection &amp; engagement PDF downloaded! You can now turn it in.
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
