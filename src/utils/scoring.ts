import { PracticeSet } from '../data/reviewSets';
import { EngagementLog, SectionKey, SetUserProgress } from '../types/progress';

function approxEqual(input: string, target: number, tol: number): boolean {
  const num = parseFloat(input.trim());
  if (!Number.isFinite(num)) return false;
  return Math.abs(num - target) <= tol;
}

export interface SectionPerformance {
  key: SectionKey;
  label: string;
  submitted: boolean;
  attempts: number;
  timeSpentSec: number;
  correctCount: number;
  totalCount: number;
  percent: number | null; // null if not yet submitted
}

export interface OverallPerformance {
  sections: SectionPerformance[];
  totalTimeSec: number;
  reflectionTimeSec: number;
  submittedCount: number;
  totalAttempts: number;
  overallCorrect: number;
  overallPossible: number;
  overallPercent: number | null;
}

export function formatDuration(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const rem = secs % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

export function evaluateSetPerformance(
  practiceSet: PracticeSet,
  progress: SetUserProgress,
  engagement: EngagementLog
): OverallPerformance {
  // Section 2: Stoichiometry (4 checks)
  const q1 = progress.q1;
  const q1AuditItems = [practiceSet.q1.flawedEquation, ...practiceSet.q1.flawedTrack];
  const q1ErrorsOk = q1AuditItems.every((item) =>
    item.isError ? q1.flaggedIds.includes(item.id) : !q1.flaggedIds.includes(item.id)
  )
    ? 1
    : 0;
  const q1CoeffsOk = practiceSet.q1.equationParts.correctCoeffs.every(
    (c, idx) => parseInt(q1.coeffs[idx] || '0', 10) === c
  )
    ? 1
    : 0;
  const q1TrackOk =
    q1.step1Num === practiceSet.q1.trackCorrectionOptions.correctStep1Num &&
    q1.step1Den === practiceSet.q1.trackCorrectionOptions.correctStep1Den &&
    q1.step2Num === practiceSet.q1.trackCorrectionOptions.correctStep2Num &&
    q1.step2Den === practiceSet.q1.trackCorrectionOptions.correctStep2Den &&
    q1.step3Num === practiceSet.q1.trackCorrectionOptions.correctStep3Num &&
    q1.step3Den === practiceSet.q1.trackCorrectionOptions.correctStep3Den
      ? 1
      : 0;
  const q1MassOk = approxEqual(q1.finalMass, practiceSet.q1.correctMass, practiceSet.q1.tolerance)
    ? 1
    : 0;
  const q1Correct = q1ErrorsOk + q1CoeffsOk + q1TrackOk + q1MassOk;
  const q1Total = 4;

  // Section 2 (4 checks)
  const q2 = progress.q2;
  const q2Correct =
    (q2.prediction === practiceSet.q2.expectedPrediction ? 1 : 0) +
    (q2.moleRatioRelation === practiceSet.q2.expectedMoleRatioRelation ? 1 : 0) +
    (q2.molarMassRelation === practiceSet.q2.expectedMolarMassRelation ? 1 : 0) +
    (q2.explanationChoice === practiceSet.q2.explanationMcq.correctIndex ? 1 : 0);
  const q2Total = 4;

  // Section 3 (4 MCQs)
  const q3 = progress.q3;
  const q3Total = practiceSet.q3.questions.length;
  const q3Correct = practiceSet.q3.questions.filter(
    (mcq) => q3.answers[mcq.id] === mcq.correctIndex
  ).length;

  // Section 4 (5 checks)
  const q4 = progress.q4;
  const q4ErrorsOk = practiceSet.q4.studentAuditCards.every((c) =>
    c.isError ? q4.flaggedZoneIds.includes(c.id) : !q4.flaggedZoneIds.includes(c.id)
  )
    ? 1
    : 0;
  const q4DiagramOk =
    practiceSet.q4.availableStamps.every(
      (s) => (q4.builtCounts[s.kind] || 0) === (practiceSet.q4.correctAfterCounts[s.kind] || 0)
    ) && Object.values(q4.builtCounts).reduce((a, b) => (a || 0) + (b || 0), 0) > 0
      ? 1
      : 0;
  const q4LimitingOk = q4.limitingReactant === practiceSet.q4.correctLimitingReactant ? 1 : 0;
  const q4CountOk =
    parseInt(q4.productCount || '0', 10) === practiceSet.q4.correctProductCount ? 1 : 0;
  const q4ExcessOk =
    parseInt(q4.excessCount || '-1', 10) === practiceSet.q4.correctExcessCount ? 1 : 0;
  const q4Correct = q4ErrorsOk + q4DiagramOk + q4LimitingOk + q4CountOk + q4ExcessOk;
  const q4Total = 5;

  // Section 5 (6 checks)
  const q5 = progress.q5;
  const q5R1Ok = approxEqual(q5.molesR1, practiceSet.q5.correctMolesR1, practiceSet.q5.tolerance)
    ? 1
    : 0;
  const q5R2Ok = approxEqual(q5.molesR2, practiceSet.q5.correctMolesR2, practiceSet.q5.tolerance)
    ? 1
    : 0;
  const q5LimOk = q5.limiting === practiceSet.q5.correctLimiting ? 1 : 0;
  const q5PartAMcqOk = q5.partAChoice === practiceSet.q5.partAMcq.correctIndex ? 1 : 0;
  const q5ProdOk = approxEqual(
    q5.maxProductMoles,
    practiceSet.q5.correctMaxProductMoles,
    practiceSet.q5.tolerance
  )
    ? 1
    : 0;
  const q5ExcessOk = approxEqual(
    q5.excessMolesRemaining,
    practiceSet.q5.correctExcessMolesRemaining,
    practiceSet.q5.tolerance
  )
    ? 1
    : 0;
  const q5Correct = q5R1Ok + q5R2Ok + q5LimOk + q5PartAMcqOk + q5ProdOk + q5ExcessOk;
  const q5Total = 6;

  // Section 2: Stoich. Calculation (3 checks)
  const q6 = progress.q6;
  const q6Steps = q6.steps || [];
  const q6CoeffsOk = practiceSet.q6.equationParts.correctCoeffs.every(
    (c, idx) => parseInt(q6.coeffs[idx] || '0', 10) === c
  )
    ? 1
    : 0;
  const q6TrackOk =
    q6Steps.length === practiceSet.q6.trackOptions.correctSteps.length &&
    practiceSet.q6.trackOptions.correctSteps.every(
      (expected, idx) =>
        q6Steps[idx]?.num === expected.num && q6Steps[idx]?.den === expected.den
    )
      ? 1
      : 0;
  const q6MassOk = approxEqual(q6.finalMass, practiceSet.q6.correctMass, practiceSet.q6.tolerance)
    ? 1
    : 0;
  const q6Correct = q6CoeffsOk + q6TrackOk + q6MassOk;
  const q6Total = 3;

  const sections: SectionPerformance[] = [
    {
      key: 'q4',
      label: '1. Particulate',
      submitted: q4.submitted,
      attempts: engagement.attempts.q4,
      timeSpentSec: engagement.timeSpentSec.q4,
      correctCount: q4Correct,
      totalCount: q4Total,
      percent: q4.submitted ? Math.round((q4Correct / q4Total) * 100) : null,
    },
    {
      key: 'q6',
      label: '2. Stoich. Calculation',
      submitted: q6.submitted,
      attempts: engagement.attempts.q6,
      timeSpentSec: engagement.timeSpentSec.q6,
      correctCount: q6Correct,
      totalCount: q6Total,
      percent: q6.submitted ? Math.round((q6Correct / q6Total) * 100) : null,
    },
    {
      key: 'q1',
      label: '3. Stoichiometry',
      submitted: q1.submitted,
      attempts: engagement.attempts.q1,
      timeSpentSec: engagement.timeSpentSec.q1,
      correctCount: q1Correct,
      totalCount: q1Total,
      percent: q1.submitted ? Math.round((q1Correct / q1Total) * 100) : null,
    },
    {
      key: 'q3',
      label: '4. Conservation',
      submitted: q3.submitted,
      attempts: engagement.attempts.q3,
      timeSpentSec: engagement.timeSpentSec.q3,
      correctCount: q3Correct,
      totalCount: q3Total,
      percent: q3.submitted ? Math.round((q3Correct / q3Total) * 100) : null,
    },
    {
      key: 'q2',
      label: '5. Mole Ratios',
      submitted: q2.submitted,
      attempts: engagement.attempts.q2,
      timeSpentSec: engagement.timeSpentSec.q2,
      correctCount: q2Correct,
      totalCount: q2Total,
      percent: q2.submitted ? Math.round((q2Correct / q2Total) * 100) : null,
    },
    {
      key: 'q5',
      label: '6. Limiting Reactant',
      submitted: q5.submitted,
      attempts: engagement.attempts.q5,
      timeSpentSec: engagement.timeSpentSec.q5,
      correctCount: q5Correct,
      totalCount: q5Total,
      percent: q5.submitted ? Math.round((q5Correct / q5Total) * 100) : null,
    },
  ];

  const submittedSections = sections.filter((s) => s.submitted);
  const overallCorrect = submittedSections.reduce((sum, s) => sum + s.correctCount, 0);
  const overallPossible = submittedSections.reduce((sum, s) => sum + s.totalCount, 0);
  const totalTimeSec =
    Object.values(engagement.timeSpentSec).reduce((sum, t) => sum + t, 0);

  return {
    sections,
    totalTimeSec,
    reflectionTimeSec: engagement.timeSpentSec.reflection,
    submittedCount: submittedSections.length,
    totalAttempts: Object.values(engagement.attempts).reduce((sum, a) => sum + a, 0),
    overallCorrect,
    overallPossible,
    overallPercent:
      overallPossible > 0 ? Math.round((overallCorrect / overallPossible) * 100) : null,
  };
}
