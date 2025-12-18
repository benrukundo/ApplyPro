// /lib/documentGenerator.ts

import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, convertInchesToTwip } from 'docx';

// Types
interface ResumeStructure {
  name: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: {
    title: string;
    company: string;
    location?: string;
    period: string;
    achievements: string[];
  }[];
  education: {
    degree: string;
    school: string;
    period: string;
    details?: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
    certifications?: string[];  // Add this line
  };
}

// Color schemes for templates
// Color schemes for templates
const colorSchemes = {
  blue: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', text: '#1f2937', light: '#eff6ff' },
  green: { primary: '#16a34a', secondary: '#15803d', accent: '#22c55e', text: '#1f2937', light: '#f0fdf4' },
  purple: { primary: '#9333ea', secondary: '#7e22ce', accent: '#a855f7', text: '#1f2937', light: '#faf5ff' },
  red: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', text: '#1f2937', light: '#fef2f2' },
  teal: { primary: '#0d9488', secondary: '#0f766e', accent: '#14b8a6', text: '#1f2937', light: '#f0fdfa' },
  orange: { primary: '#ea580c', secondary: '#c2410c', accent: '#f97316', text: '#1f2937', light: '#fff7ed' },
  gray: { primary: '#4b5563', secondary: '#374151', accent: '#6b7280', text: '#1f2937', light: '#f9fafb' },
};

// Helper function to properly capitalize text
function properCapitalize(text: string): string {
  if (!text) return '';
  
  // List of words that should remain lowercase (unless at start)
  const lowercaseWords = ['of', 'in', 'and', 'the', 'for', 'to', 'a', 'an', 'on', 'at', 'by'];
  
  // List of known acronyms/abbreviations that should be uppercase
  const acronyms = ['ICT', 'IT', 'CEO', 'CTO', 'CFO', 'MBA', 'PhD', 'MSc', 'BSc', 'BA', 'MA', 'HR', 'UI', 'UX', 'API', 'SQL', 'AWS', 'GCP', 'MVP', 'ULK', 'AUCA'];
  
  return text.split(' ').map((word, index) => {
    const upperWord = word.toUpperCase();
    
    // Check if it's a known acronym
    if (acronyms.includes(upperWord)) {
      return upperWord;
    }
    
    // Check if it should be lowercase (not at start of string)
    if (index > 0 && lowercaseWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    
    // Capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}
// Helper to clean markdown from text
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/^#+\s*/gm, '')  // Remove ## headers
    .replace(/\*\*/g, '')      // Remove bold markers
    .replace(/^\s*[-•]\s*/gm, '• ') // Normalize bullets
    .trim();
};

// Helper function to clean and deduplicate job title
function cleanJobTitle(title: string, company?: string): string {
  if (!title) return '';
  
  // Remove duplicate words/phrases
  const words = title.split(/\s+/);
  const seen = new Set<string>();
  const cleanedWords: string[] = [];
  
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (!seen.has(lowerWord)) {
      seen.add(lowerWord);
      cleanedWords.push(word);
    }
  }
  
  let cleaned = cleanedWords.join(' ');
  
  // Remove company name if it appears in title
  if (company) {
    const companyLower = company.toLowerCase();
    const cleanedLower = cleaned.toLowerCase();
    if (cleanedLower.includes(companyLower)) {
      cleaned = cleaned.replace(new RegExp(company, 'gi'), '').trim();
    }
  }
  
  // Remove common duplications like "e-health specialist e-health specialist"
  const halfLength = Math.floor(cleaned.length / 2);
  const firstHalf = cleaned.substring(0, halfLength).trim().toLowerCase();
  const secondHalf = cleaned.substring(halfLength).trim().toLowerCase();
  
  if (firstHalf === secondHalf && firstHalf.length > 3) {
    cleaned = cleaned.substring(0, halfLength).trim();
  }
  
  return properCapitalize(cleaned.trim());
}

// Enhanced parser with better date and structure handling
function parseResumeToStructure(content: string): ResumeStructure {
  const structure: ResumeStructure = {
    name: '',
    contact: { email: '', phone: '', location: '', linkedin: '', portfolio: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [], languages: [] }
  };

  // Normalize line endings and clean content
  const normalizedContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ');

  // Split into sections using common headers
  const sectionHeaders = [
    'PROFESSIONAL SUMMARY',
    'SUMMARY',
    'PROFILE',
    'PROFESSIONAL EXPERIENCE',
    'WORK EXPERIENCE',
    'EXPERIENCE',
    'EMPLOYMENT HISTORY',
    'EDUCATION',
    'ACADEMIC BACKGROUND',
    'SKILLS',
    'TECHNICAL SKILLS',
    'CORE COMPETENCIES',
    'LANGUAGES',
    'CERTIFICATIONS',
    'CERTIFICATES',
    'CONTACT',
    'CONTACT INFORMATION'
  ];

  // Create regex to split by section headers
  const sectionRegex = new RegExp(
    `^(${sectionHeaders.join('|')})\\s*$`,
    'gim'
  );

  // Find all section positions
  const sections: { name: string; start: number; end: number }[] = [];
  let match;
  const headerRegex = new RegExp(`^(${sectionHeaders.join('|')})\\s*$`, 'gim');
  
  while ((match = headerRegex.exec(normalizedContent)) !== null) {
    sections.push({
      name: match[1].toUpperCase().trim(),
      start: match.index + match[0].length,
      end: normalizedContent.length
    });
  }

  // Set end positions
  for (let i = 0; i < sections.length - 1; i++) {
    sections[i].end = sections[i + 1].start - sections[i + 1].name.length - 1;
  }

  // Extract header (name and contact) - everything before first section
  const firstSectionStart = sections.length > 0 ? 
    normalizedContent.indexOf(sections[0].name) : normalizedContent.length;
  const headerContent = normalizedContent.substring(0, firstSectionStart).trim();
  
  // Parse header for name and contact
  const headerLines = headerContent.split('\n').map(l => l.trim()).filter(l => l);
  
  if (headerLines.length > 0) {
    // First non-empty line is usually the name
    const potentialName = headerLines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    if (potentialName && !potentialName.includes('@') && !potentialName.includes('|')) {
      structure.name = potentialName.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Look for contact info in remaining header lines
    for (const line of headerLines.slice(1)) {
      const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      
      // Email
      const emailMatch = cleanLine.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) structure.contact.email = emailMatch[0];
      
      // Phone
      const phoneMatch = cleanLine.match(/\+?[\d\s\-().]{10,}/);
      if (phoneMatch) structure.contact.phone = phoneMatch[0].trim();
      
      // LinkedIn
      const linkedinMatch = cleanLine.match(/linkedin\.com\/in\/[\w-]+/i);
      if (linkedinMatch) structure.contact.linkedin = linkedinMatch[0];
      
      // Location (if it's a simple city, state format)
      if (cleanLine.match(/^[A-Z][a-z]+,?\s*[A-Z]{2}$/) || 
          cleanLine.match(/^[A-Z][a-z]+,\s*[A-Z][a-z]+$/)) {
        structure.contact.location = cleanLine;
      }
    }
  }

  // Process each section
  for (const section of sections) {
    const sectionContent = normalizedContent
      .substring(section.start, section.end)
      .trim();
    
    const sectionName = section.name.toUpperCase();
    
    // SUMMARY
    if (sectionName.includes('SUMMARY') || sectionName.includes('PROFILE')) {
      structure.summary = sectionContent
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.match(/^(PROFESSIONAL\s+)?SUMMARY$/i))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // EXPERIENCE
    else if (sectionName.includes('EXPERIENCE') || sectionName.includes('EMPLOYMENT')) {
      parseExperienceSection(sectionContent, structure);
    }
    
    // EDUCATION
    else if (sectionName.includes('EDUCATION') || sectionName.includes('ACADEMIC')) {
      parseEducationSection(sectionContent, structure);
    }
    
    // SKILLS
    else if (sectionName.includes('SKILL') || sectionName.includes('COMPETENC')) {
      parseSkillsSection(sectionContent, structure);
    }
    
    // LANGUAGES
    else if (sectionName === 'LANGUAGES') {
      parseLanguagesSection(sectionContent, structure);
    }
    
    // CERTIFICATIONS
    else if (sectionName.includes('CERTIFICATION') || sectionName.includes('CERTIFICATE')) {
      parseCertificationsSection(sectionContent, structure);
    }
  }
const certificationPattern = /\(\d{4}\)\s*$/;
const allContent = content.split('\n');

structure.skills.certifications = [];

for (const line of allContent) {
  const cleanLine = line.replace(/^[•\-*]\s*/, '').replace(/^#+\s*/, '').trim();
  
  if (certificationPattern.test(cleanLine) && cleanLine.length > 10 && cleanLine.length < 100) {
    // Check if not already in certifications
    if (!structure.skills.certifications.includes(cleanLine)) {
      structure.skills.certifications.push(cleanLine);
    }
  }
}

// Remove certifications from soft skills if they ended up there
structure.skills.soft = structure.skills.soft.filter(skill => !certificationPattern.test(skill));
  // Deduplicate
  structure.skills.technical = [...new Set(structure.skills.technical)];
  structure.skills.soft = [...new Set(structure.skills.soft)];
  structure.skills.languages = [...new Set(structure.skills.languages || [])];

  return structure;
}

// Parse experience section
function parseExperienceSection(content: string, structure: ResumeStructure): void {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentJob: {
    title: string;
    company: string;
    location: string;
    period: string;
    achievements: string[];
  } | null = null;

  let pendingTitle = ''; // Store title from previous line

  const datePattern = /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}\s*[-–]\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}|Present|Current)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    
    if (!line) continue;
    
    // Check if this is a bullet point (achievement)
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    
    if (isBullet && currentJob) {
      const achievement = line.replace(/^[•\-*]\s*/, '').trim();
      if (achievement.length > 10) {
        currentJob.achievements.push(achievement);
      }
      pendingTitle = ''; // Clear pending title after achievements
    }
    // Check if this line contains a date (job entry with company info)
    else if (datePattern.test(line)) {
      // Save previous job
      if (currentJob && (currentJob.title || currentJob.company)) {
        structure.experience.push(currentJob);
      }
      
      // Parse job entry
      let title = '';
      let company = '';
      let location = '';
      let period = '';
      
      // Extract date
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        period = dateMatch[0].replace(/\s+/g, ' ').trim();
      }
      
      // Remove date from line
      let lineWithoutDate = line.replace(datePattern, '').trim();
      lineWithoutDate = lineWithoutDate.replace(/\|\s*$/, '').replace(/^\|\s*/, '').trim();
      
      // Check if line starts with pending title (duplicate)
      if (pendingTitle && lineWithoutDate.toLowerCase().startsWith(pendingTitle.toLowerCase())) {
        // Remove duplicate title from beginning
        lineWithoutDate = lineWithoutDate.substring(pendingTitle.length).trim();
        lineWithoutDate = lineWithoutDate.replace(/^[|,]\s*/, '').trim();
        title = pendingTitle;
      }
      
      // Parse remaining content for company/location
      if (lineWithoutDate.includes('|')) {
        const parts = lineWithoutDate.split('|').map(p => p.trim()).filter(p => p);
        if (!title && parts.length >= 1) {
          // Check if first part matches pending title
          if (pendingTitle && parts[0].toLowerCase() === pendingTitle.toLowerCase()) {
            title = pendingTitle;
            parts.shift();
          } else if (!pendingTitle) {
            title = parts.shift() || '';
          }
        }
        if (parts.length >= 1) {
          const companyPart = parts[0];
          if (companyPart.includes(',')) {
            const [comp, loc] = companyPart.split(',').map(s => s.trim());
            company = comp;
            location = loc;
          } else {
            company = companyPart;
          }
        }
      } else if (lineWithoutDate.includes(',')) {
        if (!title) title = pendingTitle;
        const [comp, loc] = lineWithoutDate.split(',').map(s => s.trim());
        company = comp;
        location = loc;
      } else if (lineWithoutDate && !title) {
        title = pendingTitle || lineWithoutDate;
        if (pendingTitle) company = lineWithoutDate;
      }
      
      // Use pending title if we still don't have one
      if (!title && pendingTitle) {
        title = pendingTitle;
      }
      
      currentJob = {
        title: title,
        company: company,
        location: location,
        period: period,
        achievements: []
      };
      
      pendingTitle = ''; // Clear pending title
    }
    // Non-bullet, non-date line - likely a job title for next entry
    else if (!isBullet) {
      // If we have a current job and this might be next job's title
      if (currentJob) {
        // Check if next line has date (this is next job's title)
        const nextLine = lines[i + 1] || '';
        if (datePattern.test(nextLine)) {
          // This is a title for the next job
          pendingTitle = line;
        }
      } else {
        // No current job, this might be first job's title
        pendingTitle = line;
      }
    }
  }
  
  // Save last job
  if (currentJob && (currentJob.title || currentJob.company)) {
    structure.experience.push(currentJob);
  }
}

// Parse education section
function parseEducationSection(content: string, structure: ResumeStructure): void {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentEdu: {
    degree: string;
    school: string;
    period: string;
    details: string;
  } | null = null;

  const degreeKeywords = /bachelor|master|doctor|phd|associate|diploma|certificate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba/i;
  const datePattern = /\d{4}\s*[-–]\s*(?:\d{4}|Present|Current)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    
    if (!line) continue;
    
    // Skip bullet points in education (these are usually misplaced)
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      continue;
    }
    
    // Check if this looks like a degree
    if (degreeKeywords.test(line)) {
      // Save previous education
      if (currentEdu && (currentEdu.degree || currentEdu.school)) {
        structure.education.push(currentEdu);
      }
      
      let degree = line;
      let school = '';
      let period = '';
      
      // Extract date if present
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        period = dateMatch[0];
        degree = line.replace(datePattern, '').replace(/\|\s*$/, '').trim();
      }
      
      // Check for pipe separator
      if (degree.includes('|')) {
        const parts = degree.split('|').map(p => p.trim()).filter(p => p);
        degree = parts[0];
        if (parts.length > 1 && !datePattern.test(parts[1])) {
          school = parts[1];
        }
      }
      
      currentEdu = {
        degree: degree,
        school: school,
        period: period,
        details: ''
      };
    }
    // Check if this is a school name (following a degree)
    else if (currentEdu && !currentEdu.school) {
      let school = line;
      let period = '';
      
      // Extract date if present
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        period = dateMatch[0];
        school = line.replace(datePattern, '').replace(/\|\s*$/, '').replace(/^\|\s*/, '').trim();
      }
      
      if (school) {
        currentEdu.school = school;
      }
      if (period && !currentEdu.period) {
        currentEdu.period = period;
      }
    }
    // Check if line has just a date (for current education)
    else if (currentEdu && datePattern.test(line) && !currentEdu.period) {
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        currentEdu.period = dateMatch[0];
      }
    }
  }
  
  // Save last education
  if (currentEdu && (currentEdu.degree || currentEdu.school)) {
    structure.education.push(currentEdu);
  }
}

// Parse skills section
// Parse skills section - ensure each skill is separate
function parseSkillsSection(content: string, structure: ResumeStructure): void {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  // Pattern to detect certifications (contains year in parentheses)
  const certificationPattern = /\(\d{4}\)\s*$/;
  
  for (const line of lines) {
    let cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
    
    if (!cleanLine) continue;
    
    // Check for category prefix
    const technicalMatch = cleanLine.match(/^technical\s*(skills)?:\s*/i);
    const professionalMatch = cleanLine.match(/^(professional|soft\s*skills?):\s*/i);
    
    if (technicalMatch) {
      cleanLine = cleanLine.replace(technicalMatch[0], '');
      // Split by both bullets and commas to handle all formats
      let skills: string[] = [];
      if (cleanLine.includes('•')) {
        skills = cleanLine.split(/[•]/).map(s => s.trim()).filter(s => s.length > 1);
      } else if (cleanLine.includes(',')) {
        skills = cleanLine.split(',').map(s => s.trim()).filter(s => s.length > 1);
      } else if (cleanLine.trim()) {
        skills = [cleanLine.trim()];
      }

      for (const skill of skills) {
        // Check if it's a certification
        if (certificationPattern.test(skill)) {
          continue; // Skip certifications in technical
        }
        structure.skills.technical.push(skill);
      }
    }
    else if (professionalMatch) {
      cleanLine = cleanLine.replace(professionalMatch[0], '');
      // Split by both bullets and commas to handle all formats
      let skills: string[] = [];
      if (cleanLine.includes('•')) {
        skills = cleanLine.split(/[•]/).map(s => s.trim()).filter(s => s.length > 1);
      } else if (cleanLine.includes(',')) {
        skills = cleanLine.split(',').map(s => s.trim()).filter(s => s.length > 1);
      } else if (cleanLine.trim()) {
        skills = [cleanLine.trim()];
      }

      for (const skill of skills) {
        // Check if it's a certification (has year like (2023))
        if (certificationPattern.test(skill)) {
          continue; // Skip certifications
        }
        structure.skills.soft.push(skill);
      }
    }
    // Line with bullets separating items
    else if (cleanLine.includes('•')) {
      const items = cleanLine.split('•').map(s => s.trim()).filter(s => s.length > 1);
      for (const item of items) {
        // Skip certifications
        if (certificationPattern.test(item)) {
          continue;
        }
        
        if (/javascript|python|java|react|node|sql|html|css|typescript|c#|\.net|php|aws|azure|docker|postgresql|mysql|windows|linux|server|network|dhis|openmrs|power bi|virtualization|voip|active directory|exchange/i.test(item)) {
          structure.skills.technical.push(item);
        } else {
          structure.skills.soft.push(item);
        }
      }
    }
    // Comma-separated
    else if (cleanLine.includes(',')) {
      const items = cleanLine.split(',').map(s => s.trim()).filter(s => s.length > 1);
      for (const item of items) {
        if (certificationPattern.test(item)) {
          continue;
        }
        
        if (/javascript|python|java|react|node|sql|html|css|typescript|c#|\.net|php|aws|azure|docker|postgresql|mysql|windows|linux|server|network|dhis|openmrs|power bi|virtualization|voip/i.test(item)) {
          structure.skills.technical.push(item);
        } else {
          structure.skills.soft.push(item);
        }
      }
    }
    // Single item
    else if (cleanLine.length > 2 && cleanLine.length < 80) {
      // Skip certifications
      if (certificationPattern.test(cleanLine)) {
        continue;
      }
      
      if (/javascript|python|java|react|node|sql|html|css|typescript|c#|\.net|php|aws|azure|docker|postgresql|mysql|windows|linux|server|network|dhis|openmrs|power bi|virtualization|voip/i.test(cleanLine)) {
        structure.skills.technical.push(cleanLine);
      } else {
        structure.skills.soft.push(cleanLine);
      }
    }
  }
}

// Parse languages section
function parseLanguagesSection(content: string, structure: ResumeStructure): void {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
    
    if (!cleanLine || cleanLine.toLowerCase() === 'languages') continue;
    
    // Check for comma-separated languages
    if (cleanLine.includes(',')) {
      const langs = cleanLine.split(',').map(l => l.trim()).filter(l => l);
      structure.skills.languages?.push(...langs);
    }
    // Check for bullet with proficiency
    else if (cleanLine.match(/\(.*\)/) || cleanLine.length < 30) {
      structure.skills.languages?.push(cleanLine);
    }
  }
}

// Parse certifications section
function parseCertificationsSection(content: string, structure: ResumeStructure): void {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  // Pattern to detect certifications (contains year in parentheses)
  const certificationPattern = /\(\d{4}\)\s*$/;
  
  // We'll store certifications in a temporary array
  const certifications: string[] = [];
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
    
    if (!cleanLine || cleanLine.toLowerCase().includes('certification')) continue;
    
    // Check for items with years
    if (certificationPattern.test(cleanLine)) {
      certifications.push(cleanLine);
    }
    // Check for bullet-separated items
    else if (cleanLine.includes('•')) {
      const items = cleanLine.split('•').map(s => s.trim()).filter(s => s.length > 1);
      for (const item of items) {
        if (certificationPattern.test(item)) {
          certifications.push(item);
        }
      }
    }
  }
  
  // Add certifications to structure (we can add them as a special category)
  // For now, we won't add them to soft skills
}

// Generate Modern Template PDF
// Generate Modern Template PDF
// Generate Modern Template PDF
function generateModernPDF(structure: ResumeStructure, color: keyof typeof colorSchemes): jsPDF {
  const doc = new jsPDF();
  const colors = colorSchemes[color];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const sidebarWidth = 65;

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const primaryRgb = hexToRgb(colors.primary);
  const lightRgb = hexToRgb(colors.light);

  // Draw sidebar background for current page
  const drawSidebarBackground = () => {
    doc.setFillColor(lightRgb.r, lightRgb.g, lightRgb.b);
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
  };

  // Draw header accent bar
  const drawHeaderBar = () => {
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(sidebarWidth, 0, pageWidth - sidebarWidth, 8, 'F');
  };

  // Initial page setup
  drawSidebarBackground();
  drawHeaderBar();

  // ============ SIDEBAR CONTENT ============
  let sideY = 15;

  // CONTACT Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('CONTACT', margin, sideY);
  sideY += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);

  if (structure.contact.email) {
    doc.text(structure.contact.email, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
    sideY += 5;
  }
  if (structure.contact.phone) {
    doc.text(structure.contact.phone, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
    sideY += 5;
  }
  if (structure.contact.location) {
    doc.text(structure.contact.location, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
    sideY += 5;
  }
  if (structure.contact.linkedin) {
    const linkedinText = structure.contact.linkedin.replace('https://', '').replace('www.', '');
    doc.text(linkedinText, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
    sideY += 5;
  }
  if (structure.contact.portfolio) {
    doc.text(structure.contact.portfolio, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
    sideY += 5;
  }

  sideY += 8;

  // SKILLS Section
  if (structure.skills.technical.length > 0 || structure.skills.soft.length > 0) {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('SKILLS', margin, sideY);
  sideY += 6;

  const maxSkillWidth = sidebarWidth - margin - 8;

  if (structure.skills.technical.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    doc.text('Technical:', margin, sideY);
    sideY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);

    // Display each skill on its own line with bullet
    for (const skill of structure.skills.technical) {
      // Check if we're running out of space
      if (sideY > pageHeight - 30) break;

      // Split long skills across multiple lines if needed
      const skillLines = doc.splitTextToSize('• ' + skill, maxSkillWidth);
      skillLines.forEach((line: string) => {
        doc.text(line, margin, sideY);
        sideY += 3.5;
      });
    }
    sideY += 3;
  }

  if (structure.skills.soft.length > 0 && sideY < pageHeight - 40) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    doc.text('Professional:', margin, sideY);
    sideY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);

    // Display each skill on its own line with bullet
    for (const skill of structure.skills.soft) {
      // Check if we're running out of space
      if (sideY > pageHeight - 30) break;

      // Split long skills across multiple lines if needed
      const skillLines = doc.splitTextToSize('• ' + skill, maxSkillWidth);
      skillLines.forEach((line: string) => {
        doc.text(line, margin, sideY);
        sideY += 3.5;
      });
    }
    sideY += 3;
  }
}

  // LANGUAGES Section
  if (structure.skills.languages && structure.skills.languages.length > 0) {
    sideY += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('LANGUAGES', margin, sideY);
    sideY += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    structure.skills.languages.forEach(lang => {
      doc.text('• ' + lang, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
      sideY += 4;
    });
  }
// CERTIFICATIONS Section in Sidebar
if (structure.skills.certifications && structure.skills.certifications.length > 0 && sideY < pageHeight - 30) {
  sideY += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('CERTIFICATIONS', margin, sideY);
  sideY += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  const maxCertWidth = sidebarWidth - margin - 5;
  
  for (const cert of structure.skills.certifications.slice(0, 6)) {
    if (sideY > pageHeight - 15) break;
    
    // Wrap long certifications
    const certLines = doc.splitTextToSize('• ' + cert, maxCertWidth);
    doc.text(certLines, margin, sideY);
    sideY += certLines.length * 3;
  }
}
  // EDUCATION Section
  if (structure.education.length > 0 && sideY < pageHeight - 30) {
  sideY += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('EDUCATION', margin, sideY);
  sideY += 6;

  const maxEduWidth = sidebarWidth - margin - 5;

  for (const edu of structure.education) {
    if (sideY > pageHeight - 20) break;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    
    // Wrap degree text
    const degreeLines = doc.splitTextToSize(edu.degree, maxEduWidth);
    doc.text(degreeLines, margin, sideY);
    sideY += degreeLines.length * 3.5;

    if (edu.school) {
      doc.setFont('helvetica', 'normal');
      const schoolLines = doc.splitTextToSize(edu.school, maxEduWidth);
      doc.text(schoolLines, margin, sideY);
      sideY += schoolLines.length * 3.5;
    }
    
    if (edu.period) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text(edu.period, margin, sideY);
      sideY += 3.5;
    }
    
    sideY += 3;
  }
}

  // ============ MAIN CONTENT AREA ============
 const mainX = sidebarWidth + 8;
const mainWidth = pageWidth - sidebarWidth - margin - 8;
let yPos = 18;

// Name
doc.setFontSize(28);
doc.setFont('helvetica', 'bold');
doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
doc.text(structure.name || 'Your Name', mainX, yPos);
yPos += 14;

// PROFESSIONAL SUMMARY
if (structure.summary) {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('PROFESSIONAL SUMMARY', mainX, yPos);
  yPos += 2;
  
  // Full-width thin underline
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.3);
  doc.line(mainX, yPos, mainX + mainWidth, yPos);
  yPos += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  const summaryLines = doc.splitTextToSize(structure.summary, mainWidth);
  doc.text(summaryLines, mainX, yPos);
  yPos += summaryLines.length * 4.5 + 6;
}

// PROFESSIONAL EXPERIENCE
if (structure.experience.length > 0) {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('PROFESSIONAL EXPERIENCE', mainX, yPos);
  yPos += 2;
  
  // Full-width thin underline
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.3);
  doc.line(mainX, yPos, mainX + mainWidth, yPos);
  yPos += 6;

  for (const exp of structure.experience) {
    // Calculate space needed for this job entry
    const spaceNeeded = 20 + (exp.achievements.length * 5);
    
    // Check for page break
    if (yPos > pageHeight - Math.min(spaceNeeded, 45)) {
      doc.addPage();
      drawSidebarBackground();
      yPos = 20;
    }

    // Job Title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(exp.title, mainX, yPos);
    yPos += 5;

    // Company, Location | Period
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    
    let companyLine = exp.company;
    if (exp.location) {
      companyLine += ', ' + exp.location;
    }
    
    doc.text(companyLine, mainX, yPos);
    
    if (exp.period) {
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      const periodText = ' | ' + exp.period;
      const companyWidth = doc.getTextWidth(companyLine);
      doc.text(periodText, mainX + companyWidth, yPos);
    }
    yPos += 5;

    // Achievements
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    for (const achievement of exp.achievements) {
      if (yPos > pageHeight - 15) {
        doc.addPage();
        drawSidebarBackground();
        yPos = 20;
      }

      const bulletText = '• ' + achievement;
      const achLines = doc.splitTextToSize(bulletText, mainWidth - 3);
      doc.text(achLines, mainX, yPos);
      yPos += achLines.length * 4.5 + 1;
    }
    yPos += 5;
  }
}
  return doc;
}


// Generate Traditional Template PDF
function generateTraditionalPDF(structure: ResumeStructure): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Header - Name centered
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(structure.name || 'Your Name', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Contact info centered
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  const contactParts = [
    structure.contact.email,
    structure.contact.phone,
    structure.contact.location,
    structure.contact.linkedin
  ].filter(Boolean);
  doc.text(contactParts.join(' | '), pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Horizontal line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Helper function for section headers
  const addSectionHeader = (title: string) => {
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text(title, margin, yPos);
    yPos += 2;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
  };

  // Summary
  if (structure.summary) {
    addSectionHeader('PROFESSIONAL SUMMARY');
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    const summaryLines = doc.splitTextToSize(structure.summary, pageWidth - 2 * margin);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 8;
  }

  // Experience
  if (structure.experience.length > 0) {
    addSectionHeader('PROFESSIONAL EXPERIENCE');

    for (const exp of structure.experience) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      // Job title and period
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(exp.title, margin, yPos);
      
      if (exp.period) {
        doc.setFont('times', 'italic');
        const periodWidth = doc.getTextWidth(exp.period);
        doc.text(exp.period, pageWidth - margin - periodWidth, yPos);
      }
      yPos += 5;

      // Company
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      let companyLine = exp.company;
      if (exp.location) companyLine += `, ${exp.location}`;
      doc.text(companyLine, margin, yPos);
      yPos += 5;

      // Achievements
      doc.setFont('times', 'normal');
      for (const achievement of exp.achievements) {
        if (yPos > pageHeight - 15) {
          doc.addPage();
          yPos = margin;
        }
        const bulletText = `• ${achievement}`;
        const achLines = doc.splitTextToSize(bulletText, pageWidth - 2 * margin - 5);
        doc.text(achLines, margin + 5, yPos);
        yPos += achLines.length * 4 + 2;
      }
      yPos += 5;
    }
  }

  // Education
  if (structure.education.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }
    addSectionHeader('EDUCATION');

    for (const edu of structure.education) {
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(edu.degree, margin, yPos);
      
      if (edu.period) {
        doc.setFont('times', 'italic');
        const periodWidth = doc.getTextWidth(edu.period);
        doc.text(edu.period, pageWidth - margin - periodWidth, yPos);
      }
      yPos += 5;

      if (edu.school) {
        doc.setFontSize(10);
        doc.setFont('times', 'italic');
        doc.text(edu.school, margin, yPos);
        yPos += 5;
      }
      yPos += 3;
    }
  }

  // Skills
  if (structure.skills.technical.length > 0 || structure.skills.soft.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }
    addSectionHeader('SKILLS');

    doc.setFontSize(10);
    doc.setFont('times', 'normal');

    if (structure.skills.technical.length > 0) {
      doc.setFont('times', 'bold');
      doc.text('Technical Skills:', margin, yPos);
      yPos += 5;
      doc.setFont('times', 'normal');

      for (const skill of structure.skills.technical) {
        if (yPos > pageHeight - 20) break;
        const skillLines = doc.splitTextToSize('• ' + skill, pageWidth - 2 * margin - 5);
        skillLines.forEach((line: string) => {
          doc.text(line, margin + 5, yPos);
          yPos += 4;
        });
      }
      yPos += 2;
    }

    if (structure.skills.soft.length > 0) {
      doc.setFont('times', 'bold');
      doc.text('Professional Skills:', margin, yPos);
      yPos += 5;
      doc.setFont('times', 'normal');

      for (const skill of structure.skills.soft) {
        if (yPos > pageHeight - 20) break;
        const skillLines = doc.splitTextToSize('• ' + skill, pageWidth - 2 * margin - 5);
        skillLines.forEach((line: string) => {
          doc.text(line, margin + 5, yPos);
          yPos += 4;
        });
      }
      yPos += 2;
    }

    if (structure.skills.languages && structure.skills.languages.length > 0) {
      doc.setFont('times', 'bold');
      doc.text('Languages:', margin, yPos);
      yPos += 5;
      doc.setFont('times', 'normal');

      for (const lang of structure.skills.languages) {
        if (yPos > pageHeight - 20) break;
        doc.text('• ' + lang, margin + 5, yPos);
        yPos += 4;
      }
    }
  }

  return doc;
}

// Generate ATS-Friendly Template PDF
function generateATSPDF(structure: ResumeStructure): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  let yPos = margin;

  // Simple header - Name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(structure.name || 'Your Name', margin, yPos);
  yPos += 8;

  // Contact info on one line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const contactLine = [
    structure.contact.email,
    structure.contact.phone,
    structure.contact.location
  ].filter(Boolean).join(' | ');
  doc.text(contactLine, margin, yPos);
  yPos += 5;

  if (structure.contact.linkedin) {
    doc.text(structure.contact.linkedin, margin, yPos);
    yPos += 5;
  }
  yPos += 8;

  // Simple section header helper
  const addSection = (title: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin, yPos);
    yPos += 6;
  };

  // Summary
  if (structure.summary) {
    addSection('Summary');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(structure.summary, pageWidth - 2 * margin);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5 + 8;
  }

  // Experience
  if (structure.experience.length > 0) {
    addSection('Experience');

    for (const exp of structure.experience) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title, margin, yPos);
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let companyLine = exp.company;
      if (exp.location) companyLine += `, ${exp.location}`;
      if (exp.period) companyLine += ` | ${exp.period}`;
      doc.text(companyLine, margin, yPos);
      yPos += 5;

      for (const achievement of exp.achievements) {
        if (yPos > pageHeight - 15) {
          doc.addPage();
          yPos = margin;
        }
        const text = `- ${achievement}`;
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 5);
        doc.text(lines, margin + 3, yPos);
        yPos += lines.length * 4 + 2;
      }
      yPos += 5;
    }
  }

  // Education
  if (structure.education.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }
    addSection('Education');

    for (const edu of structure.education) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, margin, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      let eduLine = edu.school || '';
      if (edu.period) eduLine += eduLine ? ` | ${edu.period}` : edu.period;
      if (eduLine) {
        doc.text(eduLine, margin, yPos);
        yPos += 5;
      }
      yPos += 3;
    }
  }

  // Skills
  if (structure.skills.technical.length > 0 || structure.skills.soft.length > 0) {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }
    addSection('Skills');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const allSkills = [
      ...structure.skills.technical,
      ...structure.skills.soft,
      ...(structure.skills.languages || [])
    ];

    for (const skill of allSkills) {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      const skillLines = doc.splitTextToSize('• ' + skill, pageWidth - 2 * margin - 5);
      skillLines.forEach((line: string) => {
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
    }
  }

  return doc;
}

// Generate Modern DOCX
async function generateModernDOCX(structure: ResumeStructure, color: keyof typeof colorSchemes): Promise<Blob> {
  const colors = colorSchemes[color];

  // Build sidebar content (left column)
  const sidebarChildren: Paragraph[] = [];
  
  // Contact Section
  sidebarChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'CONTACT',
          bold: true,
          size: 22,
          color: colors.primary.replace('#', ''),
        }),
      ],
      spacing: { after: 150 },
    })
  );

  if (structure.contact.email) {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '✉ ', size: 18 }),
          new TextRun({ text: structure.contact.email, size: 18, color: '4a4a4a' }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  if (structure.contact.phone) {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '✆ ', size: 18 }),
          new TextRun({ text: structure.contact.phone, size: 18, color: '4a4a4a' }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  if (structure.contact.location) {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '⌂ ', size: 18 }),
          new TextRun({ text: structure.contact.location, size: 18, color: '4a4a4a' }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  if (structure.contact.linkedin) {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: structure.contact.linkedin, size: 18, color: '4a4a4a' }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Skills Section in Sidebar
  if (structure.skills.technical.length > 0 || structure.skills.soft.length > 0) {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 22,
            color: colors.primary.replace('#', ''),
          }),
        ],
        spacing: { before: 250, after: 150 },
      })
    );

    if (structure.skills.technical.length > 0) {
      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Technical:', bold: true, size: 18, color: '4a4a4a' }),
          ],
          spacing: { after: 50 },
        })
      );
      structure.skills.technical.forEach(skill => {
        sidebarChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${skill}`, size: 18, color: '4a4a4a' }),
            ],
            spacing: { after: 30 },
          })
        );
      });
    }

    if (structure.skills.soft.length > 0) {
      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Professional:', bold: true, size: 18, color: '4a4a4a' }),
          ],
          spacing: { before: 100, after: 50 },
        })
      );
      structure.skills.soft.forEach(skill => {
        sidebarChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${skill}`, size: 18, color: '4a4a4a' }),
            ],
            spacing: { after: 30 },
          })
        );
      });
    }
  }

  // Languages in Sidebar
  if (structure.skills.languages && structure.skills.languages.length > 0) {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'LANGUAGES',
            bold: true,
            size: 22,
            color: colors.primary.replace('#', ''),
          }),
        ],
        spacing: { before: 250, after: 150 },
      })
    );
    structure.skills.languages.forEach(lang => {
      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${lang}`, size: 18, color: '4a4a4a' }),
          ],
          spacing: { after: 30 },
        })
      );
    });
  }
// Certifications in Sidebar
if (structure.skills.certifications && structure.skills.certifications.length > 0) {
  sidebarChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'CERTIFICATIONS',
          bold: true,
          size: 22,
          color: colors.primary.replace('#', ''),
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  structure.skills.certifications.forEach(cert => {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '• ' + cert, size: 16, color: '4a4a4a' }),
        ],
        spacing: { after: 30 },
      })
    );
  });
}
  // Education in Sidebar
  if (structure.education.length > 0) {
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 22,
            color: colors.primary.replace('#', ''),
          }),
        ],
        spacing: { before: 250, after: 150 },
      })
    );

    structure.education.forEach(edu => {
      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 18, color: '4a4a4a' }),
          ],
          spacing: { after: 30 },
        })
      );
      if (edu.school) {
        sidebarChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.school, size: 18, color: '666666' }),
            ],
            spacing: { after: 30 },
          })
        );
      }
      if (edu.period) {
        sidebarChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.period, size: 16, italics: true, color: '888888' }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });
  }

  // Build main content (right column)
  const mainChildren: Paragraph[] = [];

  // Name
  mainChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: structure.name || 'Your Name',
          bold: true,
          size: 52,
          color: colors.primary.replace('#', ''),
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Professional Summary
  if (structure.summary) {
    mainChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 24,
            color: colors.primary.replace('#', ''),
          }),
        ],
        spacing: { after: 100 },
        border: {
          bottom: { color: colors.primary.replace('#', ''), size: 6, style: BorderStyle.SINGLE },
        },
      })
    );
    mainChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: structure.summary, size: 20, color: '4a4a4a' }),
        ],
        spacing: { after: 250 },
      })
    );
  }

  // Professional Experience
  if (structure.experience.length > 0) {
    mainChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 24,
            color: colors.primary.replace('#', ''),
          }),
        ],
        spacing: { after: 100 },
        border: {
          bottom: { color: colors.primary.replace('#', ''), size: 6, style: BorderStyle.SINGLE },
        },
      })
    );

    structure.experience.forEach(exp => {
      // Job Title
      mainChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22, color: '2a2a2a' }),
          ],
          spacing: { before: 150 },
        })
      );

      // Company, Location | Period
      mainChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? `, ${exp.location}` : ''}`,
              size: 20,
              color: colors.primary.replace('#', ''),
            }),
            new TextRun({
              text: exp.period ? ` | ${exp.period}` : '',
              size: 20,
              italics: true,
              color: '888888',
            }),
          ],
          spacing: { after: 80 },
        })
      );

      // Achievements
      exp.achievements.forEach(achievement => {
        mainChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${achievement}`, size: 20, color: '4a4a4a' }),
            ],
            spacing: { after: 50 },
          })
        );
      });
    });
  }

  // Create two-column table layout
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.5),
            bottom: convertInchesToTwip(0.5),
            left: convertInchesToTwip(0.3),
            right: convertInchesToTwip(0.3),
          },
        },
      },
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                // Left column (sidebar) - 30% width
                new TableCell({
                  width: { size: 28, type: WidthType.PERCENTAGE },
                  shading: { fill: colors.light.replace('#', '') },
                  margins: {
                    top: convertInchesToTwip(0.2),
                    bottom: convertInchesToTwip(0.2),
                    left: convertInchesToTwip(0.2),
                    right: convertInchesToTwip(0.15),
                  },
                  children: sidebarChildren,
                }),
                // Right column (main content) - 70% width
                new TableCell({
                  width: { size: 72, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.2),
                    bottom: convertInchesToTwip(0.2),
                    left: convertInchesToTwip(0.25),
                    right: convertInchesToTwip(0.2),
                  },
                  children: mainChildren,
                }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}


// Generate Traditional DOCX
async function generateTraditionalDOCX(structure: ResumeStructure): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Centered Name
        new Paragraph({
          children: [
            new TextRun({
              text: structure.name || 'Your Name',
              bold: true,
              size: 40,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),

        // Centered Contact
        new Paragraph({
          children: [
            new TextRun({
              text: [
                structure.contact.email,
                structure.contact.phone,
                structure.contact.location,
              ].filter(Boolean).join(' | '),
              size: 22,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: {
            bottom: {
              color: '000000',
              size: 6,
              style: BorderStyle.SINGLE,
            },
          },
        }),

        // Summary
        ...(structure.summary ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL SUMMARY',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: '000000',
                size: 3,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: structure.summary,
                size: 22,
                font: 'Times New Roman',
              }),
            ],
            spacing: { after: 200 },
          }),
        ] : []),

        // Experience
        ...(structure.experience.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL EXPERIENCE',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: '000000',
                size: 3,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          ...structure.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 24,
                  font: 'Times New Roman',
                }),
                new TextRun({
                  text: exp.period ? `  ${exp.period}` : '',
                  italics: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { before: 150 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.company}${exp.location ? `, ${exp.location}` : ''}`,
                  italics: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { after: 50 },
            }),
            ...exp.achievements.map(ach =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${ach}`,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
                spacing: { after: 30 },
              })
            ),
          ]),
        ] : []),

        // Education
        ...(structure.education.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'EDUCATION',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: '000000',
                size: 3,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          ...structure.education.flatMap(edu => [
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree,
                  bold: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
                new TextRun({
                  text: edu.period ? `  ${edu.period}` : '',
                  italics: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.school || '',
                  italics: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { after: 100 },
            }),
          ]),
        ] : []),

        // Skills
        ...((structure.skills.technical.length > 0 || structure.skills.soft.length > 0) ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'SKILLS',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 200, after: 100 },
            border: {
              bottom: {
                color: '000000',
                size: 3,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          ...(structure.skills.technical.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Technical Skills:',
                  bold: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { after: 100 },
            }),
            ...structure.skills.technical.map(skill =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${skill}`,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
                spacing: { after: 50 },
              })
            ),
          ] : []),
          ...(structure.skills.soft.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Professional Skills:',
                  bold: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { after: 100 },
            }),
            ...structure.skills.soft.map(skill =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${skill}`,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
                spacing: { after: 50 },
              })
            ),
          ] : []),
        ] : []),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}

// Generate ATS DOCX (simple, clean format)
async function generateATSDOCX(structure: ResumeStructure): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Name
        new Paragraph({
          children: [
            new TextRun({
              text: structure.name || 'Your Name',
              bold: true,
              size: 36,
            }),
          ],
          spacing: { after: 100 },
        }),

        // Contact
        new Paragraph({
          children: [
            new TextRun({
              text: [
                structure.contact.email,
                structure.contact.phone,
                structure.contact.location,
              ].filter(Boolean).join(' | '),
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        }),
        ...(structure.contact.linkedin ? [
          new Paragraph({
            children: [
              new TextRun({
                text: structure.contact.linkedin,
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),
        ] : []),

        // Summary
        ...(structure.summary ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'SUMMARY',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: structure.summary,
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),
        ] : []),

        // Experience
        ...(structure.experience.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'EXPERIENCE',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          ...structure.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 150 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.company}${exp.location ? `, ${exp.location}` : ''}${exp.period ? ` | ${exp.period}` : ''}`,
                  size: 22,
                }),
              ],
              spacing: { after: 50 },
            }),
            ...exp.achievements.map(ach =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `- ${ach}`,
                    size: 22,
                  }),
                ],
                spacing: { after: 30 },
              })
            ),
          ]),
        ] : []),

        // Education
        ...(structure.education.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'EDUCATION',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          ...structure.education.flatMap(edu => [
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree,
                  bold: true,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.school || ''}${edu.period ? ` | ${edu.period}` : ''}`,
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            }),
          ]),
        ] : []),

        // Skills
        ...((structure.skills.technical.length > 0 || structure.skills.soft.length > 0) ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'SKILLS',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          ...[
            ...structure.skills.technical,
            ...structure.skills.soft,
            ...(structure.skills.languages || []),
          ].map(skill =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${skill}`,
                  size: 22,
                }),
              ],
              spacing: { after: 50 },
            })
          ),
        ] : []),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}

// Main export functions
export async function generatePDF(
  content: string,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  color: keyof typeof colorSchemes = 'blue'
): Promise<Blob> {
  const structure = parseResumeToStructure(content);
  
  let doc: jsPDF;
  
  switch (template) {
    case 'traditional':
      doc = generateTraditionalPDF(structure);
      break;
    case 'ats':
      doc = generateATSPDF(structure);
      break;
    case 'modern':
    default:
      doc = generateModernPDF(structure, color);
      break;
  }
  
  return doc.output('blob');
}

export async function generateDOCX(
  content: string,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  color: keyof typeof colorSchemes = 'blue'
): Promise<Blob> {
  const structure = parseResumeToStructure(content);
  
  switch (template) {
    case 'traditional':
      return await generateTraditionalDOCX(structure);
    case 'ats':
      return await generateATSDOCX(structure);
    case 'modern':
    default:
      return await generateModernDOCX(structure, color);
  }
}
// Cover Letter PDF Generator
export async function generateCoverLetterPDF(
  content: string,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  color: keyof typeof colorSchemes = 'blue'
): Promise<Blob> {
  const doc = new jsPDF();
  const colors = colorSchemes[color];
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const primaryRgb = hexToRgb(colors.primary);

  // Header line for modern template
  if (template === 'modern') {
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, pageWidth, 4, 'F');
    yPos = 20;
  }

  // Set font based on template
  const fontFamily = template === 'traditional' ? 'times' : 'helvetica';
  
  doc.setFontSize(11);
  doc.setFont(fontFamily, 'normal');
  doc.setTextColor(60, 60, 60);

  // Split content into paragraphs and render
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph.trim(), pageWidth - 2 * margin);
    
    if (yPos + lines.length * 6 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.text(lines, margin, yPos);
    yPos += lines.length * 6 + 8;
  }

  return doc.output('blob');
}

// Cover Letter DOCX Generator
export async function generateCoverLetterDOCX(
  content: string,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  color: keyof typeof colorSchemes = 'blue'
): Promise<Blob> {
  const colors = colorSchemes[color];
  const fontFamily = template === 'traditional' ? 'Times New Roman' : undefined;

  const paragraphs = content.split('\n\n').filter(p => p.trim());

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs.map(paragraph => 
        new Paragraph({
          children: [
            new TextRun({
              text: paragraph.trim(),
              size: 22,
              font: fontFamily,
            }),
          ],
          spacing: { after: 200 },
        })
      ),
    }],
  });

  return await Packer.toBlob(doc);
}

// Add these new functions at the end of documentGenerator.ts, before the existing exports

// Generate PDF from structured data (for builder flow - no parsing needed)
export async function generatePDFFromStructure(
  structure: ResumeStructure,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  color: keyof typeof colorSchemes = 'blue'
): Promise<Blob> {
  let doc: jsPDF;
  
  switch (template) {
    case 'traditional':
      doc = generateTraditionalPDF(structure);
      break;
    case 'ats':
      doc = generateATSPDF(structure);
      break;
    case 'modern':
    default:
      doc = generateModernPDF(structure, color);
      break;
  }
  
  return doc.output('blob');
}

// Generate DOCX from structured data (for builder flow - no parsing needed)
export async function generateDOCXFromStructure(
  structure: ResumeStructure,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  color: keyof typeof colorSchemes = 'blue'
): Promise<Blob> {
  switch (template) {
    case 'traditional':
      return await generateTraditionalDOCX(structure);
    case 'ats':
      return await generateATSDOCX(structure);
    case 'modern':
    default:
      return await generateModernDOCX(structure, color);
  }
}
// Export ColorPreset type
export type ColorPreset = keyof typeof colorSchemes;

// Export types for use in other files
export type { ResumeStructure };
export { colorSchemes, parseResumeToStructure };
