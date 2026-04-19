/**
 * Paper theme tokens for FunFeed (née ScrollLearn).
 * Drop this file at: src/lib/paperTheme.ts
 *
 * Pair with the Tailwind config additions in paper-tailwind.txt.
 */

export const paper = {
  bg:      '#FAF3E4', // cream page
  bg2:     '#F3E8CF', // card tint, tab rail
  ink:     '#2B1D10', // headings & body
  inkSoft: '#8A7652', // captions, meta, timestamps
} as const;

export const paperSubject = {
  math: {
    hi:   '#FF8A4A',
    lo:   '#E05A1F',
    tint: '#FFE2C8',
    ink:  '#7A2A0A',
    handle: 'number.knight',
  },
  english: {
    hi:   '#8E5CE0',
    lo:   '#5B2FA8',
    tint: '#E8D7FF',
    ink:  '#3A1475',
    handle: 'word.witch',
  },
  science: {
    hi:   '#20B48A',
    lo:   '#0B8563',
    tint: '#C5ECDD',
    ink:  '#053F2F',
    handle: 'bio.buddy',
  },
} as const;

export type PaperSubjectKey = keyof typeof paperSubject;

export function getPaperSubject(s: string) {
  return (paperSubject as any)[s] ?? paperSubject.math;
}
