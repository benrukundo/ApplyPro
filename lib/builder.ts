// Resume Builder Data Management

export type TemplateType = 'modern' | 'traditional' | 'ats-optimized';

export interface WorkExperience {
  id: string;
  jobTitle: string;
  employer: string;
  city?: string;
  state?: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  location: string;
  degree: string;
  field: string;
  gradMonth: string;
  gradYear: string;
  stillEnrolled: boolean;
  details?: string;
}

export interface ResumeData {
  template: TemplateType;
  header: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city?: string;
    state?: string;
    country?: string;
    linkedin?: string;
    website?: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  summary?: string;
  additional?: {
    certifications?: string[];
    awards?: string[];
    languages?: string[];
    volunteer?: string[];
  };
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'applypro_resume_builder';

const isBrowser = typeof window !== 'undefined';

// Initialize empty resume data
export function initializeResumeData(template: TemplateType = 'modern'): ResumeData {
  return {
    template,
    header: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: 'United States',
      linkedin: '',
      website: '',
    },
    experience: [],
    education: [],
    skills: [],
    summary: '',
    additional: {
      certifications: [],
      awards: [],
      languages: [],
      volunteer: [],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Save resume data to localStorage
export function saveResumeData(data: ResumeData): void {
  if (!isBrowser) return;

  try {
    const updatedData = {
      ...data,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving resume data:', error);
  }
}

// Load resume data from localStorage
export function loadResumeData(): ResumeData | null {
  if (!isBrowser) return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    return JSON.parse(data) as ResumeData;
  } catch (error) {
    console.error('Error loading resume data:', error);
    return null;
  }
}

// Clear resume data from localStorage
export function clearResumeData(): void {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing resume data:', error);
  }
}

// Export resume data for download
export function exportResumeData(data: ResumeData): string {
  return JSON.stringify(data, null, 2);
}

// Validate step completion
export function isStepComplete(data: ResumeData, step: number): boolean {
  switch (step) {
    case 1: // Header
      return !!(
        data.header.firstName &&
        data.header.lastName &&
        data.header.email &&
        data.header.phone
      );
    case 2: // Experience
      return data.experience.length > 0 &&
        data.experience.every(exp => exp.jobTitle && exp.employer);
    case 3: // Education
      return data.education.length > 0 &&
        data.education.every(edu => edu.school && edu.degree && edu.field);
    case 4: // Skills
      return data.skills.length >= 3;
    case 5: // Summary (optional)
      return true;
    case 6: // Additional (optional)
      return true;
    case 7: // Finalize
      return isStepComplete(data, 1) &&
        isStepComplete(data, 2) &&
        isStepComplete(data, 3) &&
        isStepComplete(data, 4);
    default:
      return false;
  }
}

// Get step progress
export function getStepProgress(data: ResumeData): number {
  let completed = 0;
  for (let i = 1; i <= 7; i++) {
    if (isStepComplete(data, i)) completed++;
  }
  return Math.round((completed / 7) * 100);
}

// Suggested skills by job title
export const skillSuggestions: Record<string, string[]> = {
  software: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker', 'TypeScript', 'REST APIs'],
  marketing: ['SEO/SEM', 'Google Analytics', 'Social Media Marketing', 'Content Strategy', 'Email Marketing', 'Adobe Creative Suite', 'Marketing Automation', 'Data Analysis'],
  sales: ['CRM Software', 'Lead Generation', 'Negotiation', 'Account Management', 'Sales Forecasting', 'Customer Relationship Management', 'Pipeline Management', 'Cold Calling'],
  design: ['Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Sketch', 'UI/UX Design', 'Typography', 'Wireframing', 'Prototyping', 'Design Systems'],
  finance: ['Financial Analysis', 'Excel', 'QuickBooks', 'Financial Modeling', 'Budgeting', 'Forecasting', 'GAAP', 'Tax Preparation', 'Risk Management'],
  default: ['Communication', 'Problem Solving', 'Leadership', 'Time Management', 'Teamwork', 'Critical Thinking', 'Adaptability', 'Project Management'],
};

// Get skill suggestions based on job titles
export function getSkillSuggestions(experience: WorkExperience[]): string[] {
  const allSuggestions = new Set<string>();

  experience.forEach(exp => {
    const title = exp.jobTitle.toLowerCase();

    Object.entries(skillSuggestions).forEach(([key, skills]) => {
      if (title.includes(key)) {
        skills.forEach(skill => allSuggestions.add(skill));
      }
    });
  });

  // If no matches, return default suggestions
  if (allSuggestions.size === 0) {
    return skillSuggestions.default;
  }

  return Array.from(allSuggestions);
}

// Job description templates for AI assistance
export const jobDescriptionTemplates: Record<string, string[]> = {
  software: [
    'Developed and maintained software applications using modern technologies',
    'Collaborated with cross-functional teams to define and implement new features',
    'Wrote clean, scalable code following best practices and design patterns',
    'Conducted code reviews and mentored junior developers',
    'Optimized application performance and resolved technical issues',
  ],
  marketing: [
    'Developed and executed marketing campaigns across multiple channels',
    'Analyzed campaign performance metrics and provided actionable insights',
    'Managed social media presence and grew follower engagement by X%',
    'Created compelling content that increased brand awareness',
    'Collaborated with sales team to align marketing strategies with business goals',
  ],
  sales: [
    'Exceeded sales quotas by X% through strategic prospecting and relationship building',
    'Managed pipeline of X accounts with Y% conversion rate',
    'Conducted product demonstrations and presentations to potential clients',
    'Negotiated contracts and closed deals worth $X annually',
    'Built and maintained strong relationships with key decision makers',
  ],
  design: [
    'Designed user interfaces for web and mobile applications',
    'Conducted user research and usability testing to inform design decisions',
    'Created wireframes, prototypes, and high-fidelity mockups',
    'Collaborated with developers to ensure accurate implementation',
    'Maintained design systems and component libraries',
  ],
  default: [
    'Achieved measurable results through strategic planning and execution',
    'Collaborated effectively with team members and stakeholders',
    'Improved processes and workflows to increase efficiency',
    'Demonstrated leadership and initiative in challenging situations',
    'Consistently met or exceeded performance targets',
  ],
};

// Get job description suggestions
export function getJobDescriptionSuggestions(jobTitle: string): string[] {
  const title = jobTitle.toLowerCase();

  for (const [key, templates] of Object.entries(jobDescriptionTemplates)) {
    if (title.includes(key)) {
      return templates;
    }
  }

  return jobDescriptionTemplates.default;
}

// Generate months array
export const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years array (current year - 50 to current year + 5)
export function getYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let year = currentYear + 5; year >= currentYear - 50; year--) {
    years.push(year.toString());
  }

  return years;
}

// Degree options
export const degreeOptions = [
  'High School Diploma',
  'GED',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'MBA',
  'PhD',
  'Professional Degree',
  'Certificate',
  'Some College',
];

// US States
export const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];
