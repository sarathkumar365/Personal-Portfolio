export interface ExperienceSection {
  title: string;
  items: string[];
}

export interface ExperienceDetails {
  headline: string;
  overview: string;
  sections: ExperienceSection[];
  closing: string;
}

export interface ExperienceDetail {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  summary: string;
  details: ExperienceDetails;
}
