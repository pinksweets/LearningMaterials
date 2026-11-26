interface QuestionFields {
  q: string;
  exp: string;
  a?: boolean | number | (number | string)[];
  choices?: string[];
  accept?: string[];
  pairs?: { l: string; r: string }[];
  items?: { year: number; t: string }[];
  steps?: string[];
  blanks?: string[];
  card?: string | string[];
  hint?: string;
  lv?: string;
  time?: number;
  speech?: string;
  reading?: string;
  forceInput?: boolean;
  chemicalFormula?: boolean;
  strictNumeric?: boolean;
  examPractice?: boolean;
  examSection?: string;
  points?: number;
  sourceStage?: string;
  learn?: { no: number; word: string; reading: string; meaning: string };
  diagram?: Parameters<typeof import('./bio-display.js').bioDiagram>[0];
  studyDiagram?: Question['diagram'];
  maDiagram?: Parameters<typeof import('./ma26-display.js').mathADiagram>[0];
  supportGraph?: Parameters<typeof import('./math-display.js').graphSvg>[0] & { label?: string };
  trig?: Parameters<typeof import('./trig-display.js').trigDiagram>[0];
}

export type Question = QuestionFields & (
  | { type: 'yon' | 'ana'; a: number; choices: string[] }
  | { type: 'maru'; a: boolean }
  | { type: 'kumi'; pairs: { l: string; r: string }[] }
  | { type: 'nenpyo'; items: { year: number; t: string }[] }
  | { type: 'suji'; a: (number | string)[] }
  | { type: 'fill'; a: (number | string)[]; blanks: string[] }
  | { type: 'junban'; a: number[]; steps: string[] }
);

export type ActiveQuestion = Question & {
  _key: string;
  _page?: string | number;
};

export interface LessonCard {
  kind?: string;
  title: string;
  body: string;
  formula?: string;
  checkpoint?: { q: string; a: string };
  graph?: Parameters<typeof import('./math-display.js').graphSvg>[0];
  graphStep?: number;
  diagram?: Question['diagram'];
  trig?: Question['trig'];
  guidedExample?: Parameters<typeof import('./quadratic-study.js').guidedStudyHtml>[0];
  explorer?: Parameters<typeof import('./quadratic-study.js').explorerHtml>[0];
}

export interface Card {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  kind: string;
}

export interface Unit {
  id: string;
  subject?: string;
  group?: string;
  title: string;
  desc: string;
  order: number;
  page?: ActiveQuestion['_page'];
  questions: Question[];
  cards?: Card[];
  lesson?: LessonCard[];
  lessonMath?: boolean;
  focus?: boolean;
}

export type SessionMode = 'stage' | 'review' | 'boss' | 'practice' | 'leap-speed';
export type SessionResult = 'normal' | 'victory' | 'defeat';
export interface Answer {
  correct: boolean;
  timeUp: boolean;
  correctText: string;
}

export interface Session {
  sid: string;
  mode: SessionMode;
  title: string;
  list?: ActiveQuestion[];
  i?: number;
  startIndex?: number;
  correct?: number;
  combo?: number;
  maxCombo?: number;
  score?: number;
  wrongThisRun?: ActiveQuestion[];
  feverGauge?: number;
  feverLeft?: number;
  feverCount?: number;
  weakHits?: number;
  lives?: number;
  bossHP?: number;
  bossMaxHP?: number;
  bossName?: string;
  septemberReview?: boolean;
  september15Review?: boolean;
  _forceChoice?: boolean;
  _timeLeft?: number;
  _timeLimit?: number;
  _locked?: boolean;
  result?: SessionResult | null;
  resultApplied?: boolean;
  partial?: boolean;
  reportId?: string;
  reportQueued?: boolean;
  draft?: string[];
  choiceOrder?: number[] | null;
  _nenpyoOrder?: number[] | null;
  answer?: Answer | null;
  shuffledCorrect?: number;
  leapSession?: import('./leap-study.js').LeapSession;
  leapRecorded?: boolean;
}

export interface QuestionStats {
  seen: number;
  correct: number;
  box: number;
  due: string;
}

export interface StudyDay {
  answered: number;
  correct: number;
  subjects: Record<string, number>;
  modes: Record<string, number>;
}

export type MaterialStatus = 'available' | 'studying' | 'completed';

export interface MaterialSubjectPanel extends HTMLDetailsElement {
  _materialSearchActive?: boolean;
  _materialWasOpen?: boolean;
}
