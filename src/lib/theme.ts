import type { Subject } from "./schema";

export const paper = {
  bg: "#FAF3E4",
  bg2: "#F3E8CF",
  ink: "#2B1D10",
  inkSoft: "#8A7652",
  math: { hi: "#FF8A4A", lo: "#E05A1F", tint: "#FFE2C8", ink: "#7A2A0A" },
  english: { hi: "#8E5CE0", lo: "#5B2FA8", tint: "#E8D7FF", ink: "#3A1475" },
  science: { hi: "#20B48A", lo: "#0B8563", tint: "#C5ECDD", ink: "#053F2F" },
} as const;

export type PaperSubject = Subject;

export function subjectPalette(s: PaperSubject) {
  return paper[s];
}
