export type SetId = 'A' | 'B' | 'C';

export interface McqItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface DimensionalSegment {
  id: string;
  label: string;
  numerator: string;
  denominator?: string;
  isError: boolean;
  errorFeedback: string;
}

export interface Question1Data {
  title: string;
  skillFocus: string;
  prompt: string;
  flawedEquation: {
    id: string;
    display: string;
    isError: boolean;
    errorFeedback: string;
  };
  flawedTrack: DimensionalSegment[];
  flawedResult: {
    id: string;
    display: string;
    isError: boolean;
    errorFeedback: string;
  };
  equationParts: {
    reactant1: string;
    reactant2: string;
    product1: string;
    product2: string;
    correctCoeffs: [number, number, number, number];
  };
  trackCorrectionOptions: {
    givenDisplay: string;
    step1NumOptions: string[];
    step1DenOptions: string[];
    correctStep1Num: string;
    correctStep1Den: string;
    step2NumOptions: string[];
    step2DenOptions: string[];
    correctStep2Num: string;
    correctStep2Den: string;
    step3NumOptions: string[];
    step3DenOptions: string[];
    correctStep3Num: string;
    correctStep3Den: string;
  };
  targetUnit: string;
  correctMass: number;
  tolerance: number;
}

export interface Question2Data {
  title: string;
  skillFocus: string;
  context: string;
  equation: string;
  reactantSolid: { symbol: string; name: string };
  productSolid: { symbol: string; name: string };
  prompt: string;
  expectedPrediction: 'more' | 'less' | 'same';
  expectedMoleRatioRelation: 'more_moles' | 'fewer_moles' | 'equal_moles';
  expectedMolarMassRelation: 'greater_mm' | 'smaller_mm' | 'equal_mm';
  predictionHint: string;
  explanationMcq: McqItem;
}

export interface Question3Data {
  title: string;
  skillFocus: string;
  context: string;
  equation: string;
  questions: McqItem[];
}

export type ParticleKind =
  | 'Mg_atom'
  | 'Li_atom'
  | 'O_atom'
  | 'N_atom'
  | 'O2'
  | 'N2'
  | 'MgO_solid'
  | 'Li2O_solid'
  | 'Mg3N2_solid';

export interface ParticleSpec {
  kind: ParticleKind;
  label: string;
  formula: string;
}

export interface Question4Data {
  title: string;
  skillFocus: string;
  equation: string;
  prompt: string;
  solidFormula: string;
  excessFormula: string;
  keyDescription: { atomLabel: string; moleculeAtomLabel: string };
  initialParticles: { kind: ParticleKind; count: number }[];
  flawedAfterParticles: { kind: ParticleKind; count: number }[];
  studentAuditCards: {
    id: string;
    promptLabel: string;
    studentAnswer: string;
    isError: boolean;
    feedback: string;
  }[];
  availableStamps: ParticleSpec[];
  correctAfterCounts: Partial<Record<ParticleKind, number>>;
  limitingReactantOptions: string[];
  correctLimitingReactant: string;
  correctProductCount: number;
  correctExcessCount: number;
}

export interface Question5Data {
  title: string;
  skillFocus: string;
  context: string;
  equation: string;
  reactant1: { formula: string; name: string; massG: number; molarMass: number; coeff: number };
  reactant2: { formula: string; name: string; massG: number; molarMass: number; coeff: number };
  targetProduct: { formula: string; name: string; coeff: number };
  partAPrompt: string;
  partBPrompt: string;
  partCPrompt: string;
  correctLimiting: string;
  correctMolesR1: number;
  correctMolesR2: number;
  correctMaxProductMoles: number;
  correctExcessMolesRemaining: number;
  excessReactantFormula: string;
  tolerance: number;
  partAMcq: McqItem;
}

export interface PracticeSet {
  id: SetId;
  name: string;
  subtitle: string;
  q1: Question1Data;
  q2: Question2Data;
  q3: Question3Data;
  q4: Question4Data;
  q5: Question5Data;
}

export const PRACTICE_SETS: Record<SetId, PracticeSet> = {
  A: {
    id: 'A',
    name: 'Practice Set A',
    subtitle: 'Butane combustion, Mg/AgNO₃ prediction, Fe/CuSO₄ lab-loss conservation, MgO solid synthesis, Kroll Ti process',
    q1: {
      title: '2. Stoichiometry',
      skillFocus: 'Equation Balancing · Dimensional Analysis · Molar Mass',
      prompt:
        'Butane (C₄H₁₀) reacts with oxygen gas in a combustion reaction to produce carbon dioxide and water. How many grams of water (H₂O) are produced from burning 29.06 g of C₄H₁₀ in excess oxygen?',
      flawedEquation: {
        id: 'eq',
        display: 'C₄H₁₀ + 9 O₂ → 4 CO₂ + 10 H₂O',
        isError: true,
        errorFeedback:
          'Incorrectly balanced: 10 H₂O has 20 hydrogen atoms, whereas 1 C₄H₁₀ only has 10 hydrogen atoms.',
      },
      flawedTrack: [
        {
          id: 't1',
          label: 'Given Mass',
          numerator: '29.06 g C₄H₁₀',
          isError: false,
          errorFeedback: 'Starting mass matches the prompt.',
        },
        {
          id: 't2',
          label: 'Molar Mass of C₄H₁₀',
          numerator: '1 mol C₄H₁₀',
          denominator: '58.12 g C₄H₁₀',
          isError: false,
          errorFeedback: 'Correctly converts g C₄H₁₀ to mol C₄H₁₀.',
        },
        {
          id: 't3',
          label: 'Mole Ratio',
          numerator: '2 mol C₄H₁₀',
          denominator: '10 mol H₂O',
          isError: true,
          errorFeedback: 'Inverted mole ratio: mol C₄H₁₀ must be in the denominator so units cancel.',
        },
        {
          id: 't4',
          label: 'Molar Mass of H₂O',
          numerator: '180.2 g H₂O',
          denominator: '1 mol H₂O',
          isError: true,
          errorFeedback:
            'Double-counted the coefficient: molar mass is always the mass of 1 mole of H₂O (18.02 g), not 10 moles.',
        },
      ],
      flawedResult: {
        id: 'res',
        display: '= 18.02 g H₂O',
        isError: true,
        errorFeedback: 'Incorrect final value resulting from the inverted ratio and wrong molar mass.',
      },
      equationParts: {
        reactant1: 'C₄H₁₀',
        reactant2: 'O₂',
        product1: 'CO₂',
        product2: 'H₂O',
        correctCoeffs: [2, 13, 8, 10],
      },
      trackCorrectionOptions: {
        givenDisplay: '29.06 g C₄H₁₀',
        step1NumOptions: ['1 mol C₄H₁₀', '58.12 g C₄H₁₀'],
        step1DenOptions: ['58.12 g C₄H₁₀', '1 mol C₄H₁₀'],
        correctStep1Num: '1 mol C₄H₁₀',
        correctStep1Den: '58.12 g C₄H₁₀',
        step2NumOptions: ['10 mol H₂O', '2 mol C₄H₁₀', '1 mol H₂O'],
        step2DenOptions: ['2 mol C₄H₁₀', '10 mol H₂O', '1 mol C₄H₁₀'],
        correctStep2Num: '10 mol H₂O',
        correctStep2Den: '2 mol C₄H₁₀',
        step3NumOptions: ['18.02 g H₂O', '180.2 g H₂O', '1 mol H₂O'],
        step3DenOptions: ['1 mol H₂O', '10 mol H₂O', '18.02 g H₂O'],
        correctStep3Num: '18.02 g H₂O',
        correctStep3Den: '1 mol H₂O',
      },
      targetUnit: 'g H₂O',
      correctMass: 45.05,
      tolerance: 0.25,
    },

    q2: {
      title: '4. Mole Ratios & Molar Mass Prediction',
      skillFocus: 'Qualitative Prediction · Mole Ratio · Molar Mass',
      context:
        'A student places a measured mass of solid magnesium ribbon into an aqueous solution of silver nitrate to produce solid silver in a single-replacement reaction:',
      equation: 'Mg(s) + 2 AgNO₃(aq) → Mg(NO₃)₂(aq) + 2 Ag(s)',
      reactantSolid: { symbol: 'Mg', name: 'magnesium' },
      productSolid: { symbol: 'Ag', name: 'silver' },
      prompt:
        'Without calculating specific gram amounts, predict whether the mass of the new solid (Ag) formed will be more, less, or the same as the mass of the reactant solid (Mg) consumed, in terms of both mole ratio and molar mass.',
      expectedPrediction: 'more',
      expectedMoleRatioRelation: 'more_moles',
      expectedMolarMassRelation: 'greater_mm',
      predictionHint:
        'Compare the coefficients of Mg(s) and Ag(s), then compare their atomic masses on a Periodic Table.',
      explanationMcq: {
        id: 'q2a-mcq',
        question: '4. Which explanation best justifies your prediction using BOTH mole ratio and molar mass?',
        options: [
          'Less Ag forms because Mg is consumed completely while Ag remains dissolved in solution.',
          'The mass of Ag is the same as Mg because the Law of Conservation of Mass means solid reactant mass always equals solid product mass.',
          'More mass of Ag forms because twice as many moles of Ag are produced per mole of Mg reacted (2:1 mole ratio) AND each mole of Ag has a much larger molar mass (107.87 g/mol) than Mg (24.31 g/mol).',
          'More mass of Ag forms only because Ag has a larger density, while mole ratio and molar mass cancel out.',
        ],
        correctIndex: 2,
        feedbackCorrect: 'Correct! Both the 2:1 mole ratio and silver’s larger molar mass increase the solid product mass.',
        feedbackIncorrect: 'Look for the explanation that correctly uses both the 2 mol Ag : 1 mol Mg ratio and their molar masses.',
      },
    },

    q3: {
      title: '3. Conservation of Mass & Lab Errors',
      skillFocus: 'Law of Conservation of Mass · Experimental Error Analysis',
      context:
        'A student reacts 0.56 g of solid iron with excess aqueous copper(II) sulfate. Stoichiometry predicts a theoretical yield of 0.64 g of solid copper, but after filtering and drying, the student measures only 0.49 g of solid copper (less than expected):',
      equation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
      questions: [
        {
          id: 'q3a-1',
          question:
            '1. The student recovered 0.49 g of copper instead of the expected 0.64 g. Does recovering less solid mass than expected mean atoms were destroyed?',
          options: [
            'Yes, because 0.15 g of copper disappeared during the reaction.',
            'No, conservation of mass still holds; the missing copper was either not fully reacted or physically lost during lab handling.',
            'Yes, because single-replacement reactions always destroy part of the metal.',
            'No, because copper turns into oxygen gas when filtered.',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Matter is never destroyed in chemical reactions—missing mass reflects incomplete reaction or transfer loss.',
          feedbackIncorrect: 'Conservation of mass always holds; ask where the remaining 0.15 g of copper went physically.',
        },
        {
          id: 'q3a-2',
          question:
            '2. Which laboratory error most likely caused the measured mass of dry copper (0.49 g) to be LESS than the expected 0.64 g?',
          options: [
            'The student weighed the copper while it was still wet with water.',
            'Fine copper crystals passed through a torn filter paper or remained stuck on the stirring rod and beaker walls during transfer.',
            'The student forgot to zero the balance with the empty beaker, adding extra tare mass.',
            'Leftover CuSO₄ salt dried onto the copper crystals without being rinsed.',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Losing solid product through the filter or leaving crystals behind lowers the recovered mass.',
          feedbackIncorrect: 'Check which lab error removes product from the final weighed sample rather than adding extra mass.',
        },
        {
          id: 'q3a-3',
          question:
            '3. Which procedural mistake could ALSO explain recovering less copper than the 0.64 g theoretical yield?',
          options: [
            'Stopping the reaction and filtering before all 0.56 g of iron had finished reacting, then removing unreacted iron pieces before weighing copper.',
            'Drying the copper in a drying oven for too long after it was already dry.',
            'Adding extra excess CuSO₄(aq) solution at the beginning.',
            'Using distilled water to rinse soluble FeSO₄ off the copper.',
          ],
          correctIndex: 0,
          feedbackCorrect: 'Correct! If the reaction did not go to completion before separation, less Cu formed.',
          feedbackIncorrect: 'Think about what prevents all 0.56 g of Fe from turning into Cu product.',
        },
        {
          id: 'q3a-4',
          question:
            '4. How would the student’s measured mass change if they instead made the error of skipping the drying step and weighing wet copper?',
          options: [
            'The measured mass would be even lower than 0.49 g because water dissolves copper.',
            'The measured mass would be higher than expected because trapped water adds extra mass to the sample.',
            'Water has no mass on a digital balance, so the reading would stay 0.49 g.',
            'The copper would turn back into solid iron.',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Water remaining in the solid adds mass, causing an artificially high yield.',
          feedbackIncorrect: 'Consider whether liquid water trapped in a filter adds or subtracts mass on a scale.',
        },
      ],
    },

    q4: {
      title: '1. Particulate Diagram: Atoms + Molecules → One Solid',
      skillFocus: 'Particulate Models · Limiting Reactants · Solid Formation',
      equation: '2 Mg(s) + O₂(g) → 2 MgO(s)',
      prompt:
        'Single magnesium atoms (Mg) react with oxygen gas molecules (O₂) to form solid magnesium oxide, MgO(s). The left container starts with 4 Mg atoms and 3 O₂ molecules. Flag the mistakes in the student’s "After Reaction" work, then build the corrected container.',
      solidFormula: 'MgO',
      excessFormula: 'O₂',
      keyDescription: { atomLabel: 'Magnesium (Mg)', moleculeAtomLabel: 'Oxygen (O)' },
      initialParticles: [
        { kind: 'Mg_atom', count: 4 },
        { kind: 'O2', count: 3 },
      ],
      flawedAfterParticles: [
        { kind: 'MgO_solid', count: 4 },
        { kind: 'O_atom', count: 2 },
      ],
      studentAuditCards: [
        {
          id: 'err-limiting',
          promptLabel: 'Limiting Reactant',
          studentAnswer: 'O₂',
          isError: true,
          feedback: '4 Mg atoms only need 2 O₂ molecules, so Mg runs out first and O₂ is in excess.',
        },
        {
          id: 'valid-count',
          promptLabel: 'Product Particles Made',
          studentAnswer: '4 MgO',
          isError: false,
          feedback: '4 MgO solid units really are formed from the 4 Mg atoms.',
        },
        {
          id: 'err-atoms',
          promptLabel: 'Excess Particles Remaining',
          studentAnswer: '2 O atoms',
          isError: true,
          feedback: 'Leftover excess oxygen stays bonded as 1 diatomic O₂ molecule, not 2 lone O atoms.',
        },
      ],
      availableStamps: [
        { kind: 'MgO_solid', label: 'MgO (Solid)', formula: 'MgO' },
        { kind: 'Mg_atom', label: 'Mg (Atom)', formula: 'Mg' },
        { kind: 'O2', label: 'O₂ (Molecule)', formula: 'O₂' },
      ],
      correctAfterCounts: { MgO_solid: 4, O2: 1 },
      limitingReactantOptions: ['Mg', 'O₂'],
      correctLimitingReactant: 'Mg',
      correctProductCount: 4,
      correctExcessCount: 1,
    },

    q5: {
      title: '5. Quantitative Limiting Reactant & Excess',
      skillFocus: 'Limiting Reactant · Theoretical Yield · Excess Moles',
      context:
        'Titanium metal is extracted from titanium(IV) chloride in the Kroll process. At a smelter, 250.0 g of titanium(IV) chloride (TiCl₄, molar mass 189.67 g/mol) is heated with 75.0 g of magnesium (Mg, molar mass 24.31 g/mol), producing solid titanium and molten magnesium chloride:',
      equation: 'TiCl₄(g) + 2 Mg(l) → Ti(s) + 2 MgCl₂(l)',
      reactant1: { formula: 'TiCl₄', name: 'titanium(IV) chloride', massG: 250.0, molarMass: 189.67, coeff: 1 },
      reactant2: { formula: 'Mg', name: 'magnesium', massG: 75.0, molarMass: 24.31, coeff: 2 },
      targetProduct: { formula: 'Ti', name: 'titanium', coeff: 1 },
      partAPrompt: 'A. What is the limiting reactant in this reaction? Enter initial moles and select the limiting reactant.',
      partBPrompt: 'B. What is the maximum number of moles of titanium (Ti) produced?',
      partCPrompt: 'C. How many moles of the excess reagent remain in excess after the reaction completes?',
      correctLimiting: 'TiCl₄',
      correctMolesR1: 1.318,
      correctMolesR2: 3.085,
      correctMaxProductMoles: 1.318,
      correctExcessMolesRemaining: 0.449,
      excessReactantFormula: 'Mg',
      tolerance: 0.04,
      partAMcq: {
        id: 'q5a-partA-mcq',
        question: 'Which reasoning correctly justifies the limiting reactant in Part A?',
        options: [
          'Mg is limiting because 75.0 g is less mass than 250.0 g.',
          'TiCl₄ is limiting because 1.32 mol TiCl₄ requires 2.64 mol Mg (2:1 ratio), and 3.09 mol Mg is available—so Mg is in excess and TiCl₄ runs out first.',
          'Mg is limiting because its coefficient is 2, which means it gets used up twice as fast as 3.09 mol.',
          'Neither reactant limits because they are mixed in exact stoichiometric amounts.',
        ],
        correctIndex: 1,
        feedbackCorrect: 'Correct! Comparing required moles (2.64 mol Mg) against available moles (3.09 mol Mg) proves TiCl₄ limits.',
        feedbackIncorrect: 'Never compare raw gram masses or coefficients alone—compare moles required vs moles available.',
      },
    },
  },

  B: {
    id: 'B',
    name: 'Practice Set B',
    subtitle: 'Ethane combustion, Ca/AlCl₃ prediction, Zn/AgNO₃ lab-loss conservation, Li₂O solid synthesis, Methanol synthesis',
    q1: {
      title: '2. Stoichiometry',
      skillFocus: 'Equation Balancing · Dimensional Analysis · Molar Mass',
      prompt:
        'Ethane (C₂H₆) reacts with oxygen gas in a combustion reaction to produce carbon dioxide and water. How many grams of carbon dioxide (CO₂) are produced from burning 15.04 g of C₂H₆ in excess oxygen?',
      flawedEquation: {
        id: 'eq',
        display: 'C₂H₆ + 5 O₂ → 2 CO₂ + 6 H₂O',
        isError: true,
        errorFeedback:
          'Incorrectly balanced: 6 H₂O has 12 H atoms, whereas 1 C₂H₆ has only 6 H atoms.',
      },
      flawedTrack: [
        {
          id: 't1',
          label: 'Given Mass',
          numerator: '15.04 g C₂H₆',
          isError: false,
          errorFeedback: 'Starting mass matches the prompt.',
        },
        {
          id: 't2',
          label: 'Molar Mass of C₂H₆',
          numerator: '1 mol C₂H₆',
          denominator: '30.07 g C₂H₆',
          isError: false,
          errorFeedback: 'Correct molar mass conversion for C₂H₆.',
        },
        {
          id: 't3',
          label: 'Mole Ratio',
          numerator: '2 mol C₂H₆',
          denominator: '4 mol CO₂',
          isError: true,
          errorFeedback: 'Inverted mole ratio: mol C₂H₆ must be in the denominator to cancel with mol C₂H₆.',
        },
        {
          id: 't4',
          label: 'Molar Mass of CO₂',
          numerator: '176.04 g CO₂',
          denominator: '1 mol CO₂',
          isError: true,
          errorFeedback: 'Multiplied molar mass by 4 while keeping 1 mol CO₂ in the denominator.',
        },
      ],
      flawedResult: {
        id: 'res',
        display: '= 44.01 g CO₂',
        isError: true,
        errorFeedback: 'Wrong numerical evaluation from flawed setup.',
      },
      equationParts: {
        reactant1: 'C₂H₆',
        reactant2: 'O₂',
        product1: 'CO₂',
        product2: 'H₂O',
        correctCoeffs: [2, 7, 4, 6],
      },
      trackCorrectionOptions: {
        givenDisplay: '15.04 g C₂H₆',
        step1NumOptions: ['1 mol C₂H₆', '30.07 g C₂H₆'],
        step1DenOptions: ['30.07 g C₂H₆', '1 mol C₂H₆'],
        correctStep1Num: '1 mol C₂H₆',
        correctStep1Den: '30.07 g C₂H₆',
        step2NumOptions: ['4 mol CO₂', '2 mol C₂H₆', '2 mol CO₂'],
        step2DenOptions: ['2 mol C₂H₆', '4 mol CO₂', '1 mol C₂H₆'],
        correctStep2Num: '4 mol CO₂',
        correctStep2Den: '2 mol C₂H₆',
        step3NumOptions: ['44.01 g CO₂', '176.04 g CO₂', '1 mol CO₂'],
        step3DenOptions: ['1 mol CO₂', '4 mol CO₂', '44.01 g CO₂'],
        correctStep3Num: '44.01 g CO₂',
        correctStep3Den: '1 mol CO₂',
      },
      targetUnit: 'g CO₂',
      correctMass: 44.02,
      tolerance: 0.25,
    },

    q2: {
      title: '4. Mole Ratios & Molar Mass Prediction',
      skillFocus: 'Qualitative Prediction · Mole Ratio · Molar Mass',
      context:
        'A student reacts a measured mass of solid calcium metal with an aqueous solution of aluminum chloride to produce solid aluminum:',
      equation: '3 Ca(s) + 2 AlCl₃(aq) → 3 CaCl₂(aq) + 2 Al(s)',
      reactantSolid: { symbol: 'Ca', name: 'calcium' },
      productSolid: { symbol: 'Al', name: 'aluminum' },
      prompt:
        'Without calculating specific gram amounts, predict whether the mass of the new solid (Al) formed will be more, less, or the same as the mass of the reactant solid (Ca) consumed, in terms of both mole ratio and molar mass.',
      expectedPrediction: 'less',
      expectedMoleRatioRelation: 'fewer_moles',
      expectedMolarMassRelation: 'smaller_mm',
      predictionHint:
        'Notice that fewer moles of Al form (2 vs 3) AND Al has a smaller atomic mass (26.98 g/mol) than Ca (40.08 g/mol).',
      explanationMcq: {
        id: 'q2b-mcq',
        question: '4. Which explanation best justifies your prediction using BOTH mole ratio and molar mass?',
        options: [
          'More mass of Al forms because aluminum is a solid metal product.',
          'The mass of Al equals Ca because every single-replacement reaction keeps solid mass constant.',
          'Less mass of Al forms because fewer moles of Al are produced per mole of Ca reacted (2:3 mole ratio) AND Al has a smaller molar mass (26.98 g/mol) than Ca (40.08 g/mol).',
          'Less mass of Al forms only because Al is less reactive than Ca.',
        ],
        correctIndex: 2,
        feedbackCorrect: 'Correct! Both the 2:3 mole ratio (fewer moles) and Al’s smaller molar mass lower the solid product mass.',
        feedbackIncorrect: 'Compare both the 2 Al : 3 Ca mole ratio and the molar masses of Al (26.98) vs Ca (40.08).',
      },
    },

    q3: {
      title: '3. Conservation of Mass & Lab Errors',
      skillFocus: 'Law of Conservation of Mass · Experimental Error Analysis',
      context:
        'A student performs the reaction below using 0.65 g of solid zinc and excess aqueous silver nitrate. Stoichiometry predicts a theoretical yield of 2.15 g of solid silver, but after filtering and drying, the student measures only 1.78 g of solid silver (less than expected):',
      equation: 'Zn(s) + 2 AgNO₃(aq) → Zn(NO₃)₂(aq) + 2 Ag(s)',
      questions: [
        {
          id: 'q3b-1',
          question:
            '1. Recovering 1.78 g of dry Ag instead of the expected 2.15 g is lower than the theoretical yield. What does this indicate about conservation of mass?',
          options: [
            '0.37 g of silver atoms were destroyed by nitric acid.',
            'Conservation of mass still holds; 0.37 g of silver either remained in solution/unreacted or was lost on glassware and filter paper.',
            'Silver loses mass when it dries in air.',
            'Only 1.78 g of mass can ever exist in an aqueous beaker.',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Atoms are conserved—recovered yields under 100% reflect incomplete reaction or physical loss.',
          feedbackIncorrect: 'Atoms cannot be destroyed; consider where the remaining 0.37 g of silver could be physically.',
        },
        {
          id: 'q3b-2',
          question:
            '2. Which lab error directly causes the final weighed mass of silver (1.78 g) to be LESS than the expected 2.15 g?',
          options: [
            'Some silver crystals spilled or stuck to the beaker and filter funnel when transferring.',
            'The silver product was weighed while still damp with rinse water.',
            'Unreacted AgNO₃ salt crystallized inside the silver without being rinsed.',
            'The balance read 0.20 g too high before zeroing.',
          ],
          correctIndex: 0,
          feedbackCorrect: 'Correct! Spilled or unrecovered crystals reduce the measured product mass.',
          feedbackIncorrect: 'Identify which error removes actual product from the sample being weighed.',
        },
        {
          id: 'q3b-3',
          question:
            '3. Suppose a lab partner rinsed the silver crystals too aggressively and tore a pinhole in the filter paper, allowing cloudy silver particles to wash into the waste flask. How would that affect the result?',
          options: [
            'It would increase the measured mass above 2.15 g.',
            'It would decrease the measured mass below 2.15 g because solid product escaped through the hole.',
            'It would have zero effect on the measured mass.',
            'It would double the molar mass of silver.',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Solid product escaping through torn filter paper lowers the recovered mass.',
          feedbackIncorrect: 'If solid product passes into the waste filtrate, it will not be on the filter paper when weighed.',
        },
        {
          id: 'q3b-4',
          question:
            '4. If the student had NOT dried the silver completely before weighing, how would the error compare to the 1.78 g dry result?',
          options: [
            'Wet product would read even lower than 1.78 g.',
            'Wet product would read artificially higher because trapped water adds extra mass.',
            'Water evaporates instantaneously, so the reading would be identical.',
            'Wet silver converts back into Zn(s).',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Residual water adds false mass, pushing the apparent yield higher.',
          feedbackIncorrect: 'Water has mass; trapped moisture increases the reading on the balance.',
        },
      ],
    },

    q4: {
      title: '1. Particulate Diagram: Atoms + Molecules → One Solid',
      skillFocus: 'Particulate Models · Limiting Reactants · Solid Formation',
      equation: '4 Li(s) + O₂(g) → 2 Li₂O(s)',
      prompt:
        'Single lithium atoms (Li) react with oxygen gas molecules (O₂) to form solid lithium oxide, Li₂O(s). The left container starts with 8 Li atoms and 3 O₂ molecules. Flag the mistakes in the student’s "After Reaction" work, then build the corrected container.',
      solidFormula: 'Li₂O',
      excessFormula: 'O₂',
      keyDescription: { atomLabel: 'Lithium (Li)', moleculeAtomLabel: 'Oxygen (O)' },
      initialParticles: [
        { kind: 'Li_atom', count: 8 },
        { kind: 'O2', count: 3 },
      ],
      flawedAfterParticles: [
        { kind: 'Li2O_solid', count: 4 },
        { kind: 'O_atom', count: 2 },
      ],
      studentAuditCards: [
        {
          id: 'err-limiting',
          promptLabel: 'Limiting Reactant',
          studentAnswer: 'O₂',
          isError: true,
          feedback: '8 Li atoms require only 2 O₂ molecules; 3 O₂ are present, so Li runs out first.',
        },
        {
          id: 'valid-count',
          promptLabel: 'Product Particles Made',
          studentAnswer: '4 Li₂O',
          isError: false,
          feedback: '8 Li atoms combine with 4 O atoms to form 4 Li₂O solid units.',
        },
        {
          id: 'err-atoms',
          promptLabel: 'Excess Particles Remaining',
          studentAnswer: '2 O atoms',
          isError: true,
          feedback: 'Excess oxygen stays paired as 1 diatomic O₂ molecule, not 2 lone O atoms.',
        },
      ],
      availableStamps: [
        { kind: 'Li2O_solid', label: 'Li₂O (Solid)', formula: 'Li₂O' },
        { kind: 'Li_atom', label: 'Li (Atom)', formula: 'Li' },
        { kind: 'O2', label: 'O₂ (Molecule)', formula: 'O₂' },
      ],
      correctAfterCounts: { Li2O_solid: 4, O2: 1 },
      limitingReactantOptions: ['Li', 'O₂'],
      correctLimitingReactant: 'Li',
      correctProductCount: 4,
      correctExcessCount: 1,
    },

    q5: {
      title: '5. Quantitative Limiting Reactant & Excess',
      skillFocus: 'Limiting Reactant · Theoretical Yield · Excess Moles',
      context:
        'Methanol is synthesized industrially by reacting carbon monoxide gas (CO, molar mass 28.01 g/mol) with hydrogen gas (H₂, molar mass 2.016 g/mol). In a reactor, 140.0 g of CO is combined with 16.0 g of H₂:',
      equation: 'CO(g) + 2 H₂(g) → CH₃OH(l)',
      reactant1: { formula: 'CO', name: 'carbon monoxide', massG: 140.0, molarMass: 28.01, coeff: 1 },
      reactant2: { formula: 'H₂', name: 'hydrogen', massG: 16.0, molarMass: 2.016, coeff: 2 },
      targetProduct: { formula: 'CH₃OH', name: 'methanol', coeff: 1 },
      partAPrompt: 'A. What is the limiting reactant in this reaction? Enter initial moles and select the limiting reactant.',
      partBPrompt: 'B. What is the maximum number of moles of methanol (CH₃OH) produced?',
      partCPrompt: 'C. How many moles of the excess reagent are in excess?',
      correctLimiting: 'H₂',
      correctMolesR1: 4.998,
      correctMolesR2: 7.937,
      correctMaxProductMoles: 3.968,
      correctExcessMolesRemaining: 1.03,
      excessReactantFormula: 'CO',
      tolerance: 0.08,
      partAMcq: {
        id: 'q5b-partA-mcq',
        question: 'Which reasoning correctly justifies the limiting reactant in Part A?',
        options: [
          'CO is limiting because 5.00 mol is smaller than 7.94 mol.',
          'H₂ is limiting because 5.00 mol CO would require 10.00 mol H₂ (2:1 ratio), and only 7.94 mol H₂ is available.',
          'H₂ is limiting simply because 16.0 g is less than 140.0 g.',
          'CO is limiting because its molar mass is 28.01 g/mol.',
        ],
        correctIndex: 1,
        feedbackCorrect: 'Correct! 5.00 mol CO needs 10.00 mol H₂, so having only 7.94 mol H₂ makes H₂ limiting.',
        feedbackIncorrect: 'Compare the required 2:1 H₂-to-CO ratio against the actual moles present.',
      },
    },
  },

  C: {
    id: 'C',
    name: 'Practice Set C',
    subtitle: 'Pentane combustion, Mg/FeCl₃ prediction, Mg/CuCl₂ lab-loss conservation, Mg₃N₂ solid synthesis, SiC furnace',
    q1: {
      title: '2. Stoichiometry',
      skillFocus: 'Equation Balancing · Dimensional Analysis · Molar Mass',
      prompt:
        'Pentane (C₅H₁₂) reacts with oxygen gas in a combustion reaction to produce carbon dioxide and water. How many grams of carbon dioxide (CO₂) are produced from burning 36.08 g of C₅H₁₂ in excess oxygen?',
      flawedEquation: {
        id: 'eq',
        display: 'C₅H₁₂ + 11 O₂ → 5 CO₂ + 12 H₂O',
        isError: true,
        errorFeedback:
          'Incorrectly balanced: 12 H₂O contains 24 H atoms, but C₅H₁₂ only has 12 H atoms.',
      },
      flawedTrack: [
        {
          id: 't1',
          label: 'Given Mass',
          numerator: '36.08 g C₅H₁₂',
          isError: false,
          errorFeedback: 'Given mass matches the problem.',
        },
        {
          id: 't2',
          label: 'Molar Mass of C₅H₁₂',
          numerator: '1 mol C₅H₁₂',
          denominator: '72.15 g C₅H₁₂',
          isError: false,
          errorFeedback: 'Correct molar mass conversion for C₅H₁₂.',
        },
        {
          id: 't3',
          label: 'Mole Ratio',
          numerator: '1 mol C₅H₁₂',
          denominator: '5 mol CO₂',
          isError: true,
          errorFeedback: 'Inverted mole ratio: mol C₅H₁₂ must be in the denominator to cancel out.',
        },
        {
          id: 't4',
          label: 'Molar Mass of CO₂',
          numerator: '220.05 g CO₂',
          denominator: '1 mol CO₂',
          isError: true,
          errorFeedback: 'Multiplied CO₂ molar mass by 5 while keeping 1 mol CO₂ in the denominator.',
        },
      ],
      flawedResult: {
        id: 'res',
        display: '= 22.01 g CO₂',
        isError: true,
        errorFeedback: 'Incorrect final mass from inverted mole ratio and erroneous molar mass.',
      },
      equationParts: {
        reactant1: 'C₅H₁₂',
        reactant2: 'O₂',
        product1: 'CO₂',
        product2: 'H₂O',
        correctCoeffs: [1, 8, 5, 6],
      },
      trackCorrectionOptions: {
        givenDisplay: '36.08 g C₅H₁₂',
        step1NumOptions: ['1 mol C₅H₁₂', '72.15 g C₅H₁₂'],
        step1DenOptions: ['72.15 g C₅H₁₂', '1 mol C₅H₁₂'],
        correctStep1Num: '1 mol C₅H₁₂',
        correctStep1Den: '72.15 g C₅H₁₂',
        step2NumOptions: ['5 mol CO₂', '1 mol C₅H₁₂', '6 mol CO₂'],
        step2DenOptions: ['1 mol C₅H₁₂', '5 mol CO₂', '2 mol C₅H₁₂'],
        correctStep2Num: '5 mol CO₂',
        correctStep2Den: '1 mol C₅H₁₂',
        step3NumOptions: ['44.01 g CO₂', '220.05 g CO₂', '1 mol CO₂'],
        step3DenOptions: ['1 mol CO₂', '5 mol CO₂', '44.01 g CO₂'],
        correctStep3Num: '44.01 g CO₂',
        correctStep3Den: '1 mol CO₂',
      },
      targetUnit: 'g CO₂',
      correctMass: 110.04,
      tolerance: 0.4,
    },

    q2: {
      title: '4. Mole Ratios & Molar Mass Prediction',
      skillFocus: 'Qualitative Prediction · Mole Ratio · Molar Mass',
      context:
        'A student places solid magnesium ribbon into an aqueous iron(III) chloride solution to produce solid iron in a single-replacement reaction:',
      equation: '3 Mg(s) + 2 FeCl₃(aq) → 3 MgCl₂(aq) + 2 Fe(s)',
      reactantSolid: { symbol: 'Mg', name: 'magnesium' },
      productSolid: { symbol: 'Fe', name: 'iron' },
      prompt:
        'Without calculating specific gram amounts, predict whether the mass of the new solid (Fe) formed will be more, less, or the same as the mass of the reactant solid (Mg) consumed, in terms of both mole ratio and molar mass.',
      expectedPrediction: 'more',
      expectedMoleRatioRelation: 'fewer_moles',
      expectedMolarMassRelation: 'greater_mm',
      predictionHint:
        'Even though fewer moles of Fe form than Mg consumed (2:3), compare how much heavier Fe (55.85 g/mol) is than Mg (24.31 g/mol).',
      explanationMcq: {
        id: 'q2c-mcq',
        question: '4. Which explanation best justifies your prediction using BOTH mole ratio and molar mass?',
        options: [
          'Less mass of Fe forms solely because the mole ratio produces 2 moles of Fe for every 3 moles of Mg.',
          'More mass of Fe forms: even though fewer moles of Fe form (2:3 mole ratio), iron’s molar mass (55.85 g/mol) is more than double magnesium’s (24.31 g/mol), outweighing the smaller mole ratio.',
          'The mass of Fe equals Mg because both are solid metals in the same beaker.',
          'More mass of Fe forms because 3 moles of Fe form for every 2 moles of Mg.',
        ],
        correctIndex: 1,
        feedbackCorrect: 'Correct! Iron’s >2× larger molar mass outweighs the 2:3 mole ratio.',
        feedbackIncorrect: 'Balance both factors: 2 mol Fe < 3 mol Mg, while 55.85 g/mol is more than double 24.31 g/mol.',
      },
    },

    q3: {
      title: '3. Conservation of Mass & Lab Errors',
      skillFocus: 'Law of Conservation of Mass · Experimental Error Analysis',
      context:
        'A student performs the reaction below using 0.48 g of solid magnesium and excess aqueous copper(II) chloride. Stoichiometry predicts a theoretical yield of 1.25 g of solid copper, but after filtering and drying, the student recovers only 0.94 g of dry copper (less than expected):',
      equation: 'Mg(s) + CuCl₂(aq) → MgCl₂(aq) + Cu(s)',
      questions: [
        {
          id: 'q3c-1',
          question:
            '1. The student expected 1.25 g of copper but recovered only 0.94 g. Does this lower mass disprove the Law of Conservation of Mass?',
          options: [
            'Yes, because 0.31 g of copper vanished permanently.',
            'No, conservation of mass still holds; either some Mg did not finish reacting or solid copper was lost during filtering and transfer.',
            'Yes, because magnesium converts part of the copper into light energy.',
            'No, because copper has a smaller molar mass than magnesium.',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Conservation of mass holds even when lab recovery is under 100%.',
          feedbackIncorrect: 'Atoms are never destroyed; think about experimental reasons a student recovers less than 100% yield.',
        },
        {
          id: 'q3c-2',
          question:
            '2. Which laboratory error would explain why only 0.94 g of dry copper was weighed instead of 1.25 g?',
          options: [
            'Some copper flakes remained stuck to the reaction beaker or spilled over the edge of the filter paper.',
            'The copper sample was weighed before it finished drying.',
            'MgCl₂ salt crystallized inside the copper sample.',
            'Extra CuCl₂ solution was added at the start of the lab.',
          ],
          correctIndex: 0,
          feedbackCorrect: 'Correct! Leaving copper behind in the beaker or spilling during filtration lowers the measured mass.',
          feedbackIncorrect: 'Look for the mistake that leaves solid product out of the final weighed sample.',
        },
        {
          id: 'q3c-3',
          question:
            '3. Suppose the student saw bubbles or poured off the green-blue solution too early while small strips of magnesium were still reacting. Why would this produce less than 1.25 g of copper?',
          options: [
            'Pouring out unreacted solution stopped the reaction before all 0.48 g of Mg converted Cu²⁺ into solid Cu.',
            'Magnesium strips weigh more than copper crystals.',
            'Water evaporated and carried solid copper away.',
            'The solution diluted the molar mass of copper.',
          ],
          correctIndex: 0,
          feedbackCorrect: 'Correct! Stopping the reaction early leaves unreacted limiting reactant, lowering Cu yield.',
          feedbackIncorrect: 'If Mg is still reacting when decanted, not all 0.48 g Mg produced Cu.',
        },
        {
          id: 'q3c-4',
          question:
            '4. Which mistake would cause the measured mass to appear HIGHER than 1.25 g instead of lower?',
          options: [
            'Dropping the filter paper and losing half the copper.',
            'Forgetting to dry the filtered copper completely so water remains trapped in the solid.',
            'Rinsing the beaker cleanly with distilled water onto the filter.',
            'Waiting longer until all magnesium finished reacting.',
          ],
          correctIndex: 1,
          feedbackCorrect: 'Correct! Trapped moisture adds mass, inflating the apparent yield.',
          feedbackIncorrect: 'Think about what adds extra non-copper mass onto the balance.',
        },
      ],
    },

    q4: {
      title: '1. Particulate Diagram: Atoms + Molecules → One Solid',
      skillFocus: 'Particulate Models · Limiting Reactants · Solid Formation',
      equation: '3 Mg(s) + N₂(g) → Mg₃N₂(s)',
      prompt:
        'Single magnesium atoms (Mg) react with nitrogen gas molecules (N₂) to form solid magnesium nitride, Mg₃N₂(s). The left container starts with 6 Mg atoms and 3 N₂ molecules. Flag the mistakes in the student’s "After Reaction" work, then build the corrected container.',
      solidFormula: 'Mg₃N₂',
      excessFormula: 'N₂',
      keyDescription: { atomLabel: 'Magnesium (Mg)', moleculeAtomLabel: 'Nitrogen (N)' },
      initialParticles: [
        { kind: 'Mg_atom', count: 6 },
        { kind: 'N2', count: 3 },
      ],
      flawedAfterParticles: [
        { kind: 'Mg3N2_solid', count: 2 },
        { kind: 'N_atom', count: 2 },
      ],
      studentAuditCards: [
        {
          id: 'err-limiting',
          promptLabel: 'Limiting Reactant',
          studentAnswer: 'N₂',
          isError: true,
          feedback: '6 Mg atoms only need 2 N₂ molecules; 3 N₂ are present, so Mg runs out first.',
        },
        {
          id: 'valid-count',
          promptLabel: 'Product Particles Made',
          studentAnswer: '2 Mg₃N₂',
          isError: false,
          feedback: '6 Mg atoms react with 4 N atoms to produce 2 Mg₃N₂ solid units.',
        },
        {
          id: 'err-atoms',
          promptLabel: 'Excess Particles Remaining',
          studentAnswer: '2 N atoms',
          isError: true,
          feedback: 'Excess nitrogen remains bonded as 1 diatomic N₂ molecule, not 2 lone N atoms.',
        },
      ],
      availableStamps: [
        { kind: 'Mg3N2_solid', label: 'Mg₃N₂ (Solid)', formula: 'Mg₃N₂' },
        { kind: 'Mg_atom', label: 'Mg (Atom)', formula: 'Mg' },
        { kind: 'N2', label: 'N₂ (Molecule)', formula: 'N₂' },
      ],
      correctAfterCounts: { Mg3N2_solid: 2, N2: 1 },
      limitingReactantOptions: ['Mg', 'N₂'],
      correctLimitingReactant: 'Mg',
      correctProductCount: 2,
      correctExcessCount: 1,
    },

    q5: {
      title: '5. Quantitative Limiting Reactant & Excess',
      skillFocus: 'Limiting Reactant · Theoretical Yield · Excess Moles',
      context:
        'Silicon carbide (carborundum) is manufactured in an electric furnace by heating silica sand (SiO₂, molar mass 60.08 g/mol) with solid carbon (C, molar mass 12.01 g/mol), producing silicon carbide and carbon monoxide gas:',
      equation: 'SiO₂(s) + 3 C(s) → SiC(s) + 2 CO(g)',
      reactant1: { formula: 'SiO₂', name: 'silicon dioxide', massG: 150.0, molarMass: 60.08, coeff: 1 },
      reactant2: { formula: 'C', name: 'carbon', massG: 100.0, molarMass: 12.01, coeff: 3 },
      targetProduct: { formula: 'CO', name: 'carbon monoxide', coeff: 2 },
      partAPrompt: 'A. What is the limiting reactant in this reaction? Enter initial moles and select the limiting reactant.',
      partBPrompt: 'B. What is the maximum number of moles of carbon monoxide (CO) produced?',
      partCPrompt: 'C. How many moles of the excess reagent are in excess?',
      correctLimiting: 'SiO₂',
      correctMolesR1: 2.497,
      correctMolesR2: 8.326,
      correctMaxProductMoles: 4.993,
      correctExcessMolesRemaining: 0.836,
      excessReactantFormula: 'C',
      tolerance: 0.08,
      partAMcq: {
        id: 'q5c-partA-mcq',
        question: 'Which reasoning correctly justifies the limiting reactant in Part A?',
        options: [
          'C is limiting because 100.0 g is less than 150.0 g.',
          'SiO₂ is limiting because 2.50 mol SiO₂ requires 7.49 mol C (3:1 ratio), and 8.33 mol C is available—so C is in excess and SiO₂ runs out first.',
          'C is limiting because its coefficient is 3.',
          'SiO₂ is limiting simply because 2.50 mol is smaller than 8.33 mol without checking the 3:1 ratio.',
        ],
        correctIndex: 1,
        feedbackCorrect: 'Correct! 2.50 mol SiO₂ needs 7.49 mol C, which is less than the 8.33 mol C available.',
        feedbackIncorrect: 'Check required moles using the 3:1 C-to-SiO₂ ratio against available moles.',
      },
    },
  },
};
