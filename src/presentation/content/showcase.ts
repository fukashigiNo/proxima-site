export interface ShowcaseBuild {
  title: string;
  purpose: string;
  parts: string[];
  price?: number;
  city?: string;
  date?: string;
  photo?: string;
}

export const SHOWCASE: ShowcaseBuild[] = [];
