/**
 * Master Resume Data
 * Typed constants for Sandeep Kumar Amgothu's profile.
 * Used for display and reference in the UI.
 */

export const CANDIDATE = {
  fullName: 'Sandeep Kumar Amgothu',
  email: 'sandeepkumaramgothu3@gmail.com',
  phone: '+1 (203) 997-4125',
  linkedin: 'https://www.linkedin.com/in/sandeepkumaramgothu/',
  github: 'https://github.com/Sandeepkumaramgothu?tab=repositories',
  portfolio: 'https://sandeepkumaramgothu.github.io/Portfolio/#',
  googleScholar: 'https://scholar.google.com/citations?hl=en&user=7lAYrSoAAAAJ',
} as const;

export const SUPERVISOR = {
  name: 'Dulal Kar, Ph.D.',
  title: 'Professor & Dept Chair',
  department: 'Department of Computer Science',
  office: 'CI 321',
  phone: '(361) 825-5878',
  email: 'dulal.kar@tamucc.edu',
  website: 'https://faculty.tamucc.edu/dkar',
} as const;

export interface GeneratedResult {
  meta: {
    jobTitle: string;
    company: string;
    department: string;
    hiringManager: string;
    location: string;
    localAddress: string;
    workModality: 'Remote' | 'Hybrid' | 'On-site';
    topKeywords: string[];
    resumeFilename: string;
    coverLetterFilename: string;
  };
  resumeTex: string;
  coverLetterTex: string;
  emailDraft: string;
}

export type AppState =
  | 'IDLE'
  | 'GENERATING'
  | 'COMPILING'
  | 'READY'
  | 'ERROR_AI'
  | 'ERROR_COMPILE';
