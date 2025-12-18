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
  };
}

// Color schemes for templates
const colorSchemes = {
  blue: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', text: '#1f2937', light: '#eff6ff' },
  green: { primary: '#059669', secondary: '#047857', accent: '#10b981', text: '#1f2937', light: '#ecfdf5' },
  purple: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6', text: '#1f2937', light: '#f5f3ff' },
  red: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', text: '#1f2937', light: '#fef2f2' },
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
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  const structure: ResumeStructure = {
    name: '',
    contact: { email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [], languages: [] }
  };

  let currentSection = '';
  let currentExperience: typeof structure.experience[0] | null = null;
  let currentEducation: typeof structure.education[0] | null = null;
  let summaryLines: string[] = [];

  // Date patterns for matching
  const datePatterns = [
    /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})\s*[-–—]\s*((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|Present|Current)/i,
    /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|Present|Current)/i,
    /(\d{4})\s*[-–—]\s*(\d{4}|Present|Current)/i,
  ];

  // Helper to extract date from line
  const extractDate = (line: string): string | null => {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        return `${match[1]} - ${match[2]}`;
      }
    }
    return null;
  };

  // Helper to detect section headers
  const detectSection = (line: string): string => {
    const lower = line.toLowerCase().replace(/[#*_]/g, '').trim();
    
    if (lower.includes('summary') || lower.includes('profile') || lower.includes('objective')) return 'summary';
    if (lower.includes('experience') || lower.includes('employment') || lower.includes('work history')) return 'experience';
    if (lower.includes('education') || lower.includes('academic') || lower.includes('qualification')) return 'education';
    if (lower.includes('skill') || lower.includes('competenc') || lower.includes('expertise') || lower.includes('additional qualification')) return 'skills';
    if (lower.includes('contact')) return 'contact';
    
    return '';
  };

  // First pass: extract name (usually first non-section line or after CONTACT)
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    
    // Skip section headers and contact info
    if (detectSection(cleanLine)) continue;
    if (cleanLine.includes('@') || cleanLine.includes('Phone:') || cleanLine.includes('Location:')) continue;
    if (cleanLine.toLowerCase() === 'contact') continue;
    
    // Name is usually all caps or title case, 2-4 words
    const words = cleanLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && !extractDate(cleanLine)) {
      const isNameLike = words.every(w => /^[A-Z][a-zA-Z'-]*$/.test(w) || /^[A-Z]+$/.test(w));
      if (isNameLike || cleanLine === cleanLine.toUpperCase()) {
        structure.name = properCapitalize(cleanLine);
        break;
      }
    }
  }

  // Second pass: parse sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    
    // Detect section change
    const newSection = detectSection(cleanLine);
    if (newSection) {
      // Save current experience/education before switching
      if (currentExperience && currentSection === 'experience') {
        structure.experience.push(currentExperience);
        currentExperience = null;
      }
      if (currentEducation && currentSection === 'education') {
        structure.education.push(currentEducation);
        currentEducation = null;
      }
      currentSection = newSection;
      continue;
    }

    // Parse based on current section
    switch (currentSection) {
      case 'contact':
        if (cleanLine.includes('@')) {
          const emailMatch = cleanLine.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) structure.contact.email = emailMatch[0];
        }
        if (cleanLine.toLowerCase().includes('phone') || cleanLine.match(/^\+?\d[\d\s-]{8,}/)) {
          const phoneMatch = cleanLine.match(/\+?[\d\s-]{10,}/);
          if (phoneMatch) structure.contact.phone = phoneMatch[0].trim();
        }
        if (cleanLine.toLowerCase().includes('location') || cleanLine.toLowerCase().includes('address')) {
          structure.contact.location = cleanLine.replace(/^(location|address):?\s*/i, '').trim();
        }
        if (cleanLine.toLowerCase().includes('linkedin')) {
          const linkedinMatch = cleanLine.match(/linkedin[^\s]*/i) || cleanLine.match(/in\/[\w.-]+/i);
          if (linkedinMatch) structure.contact.linkedin = linkedinMatch[0];
        }
        break;

      case 'summary':
        if (cleanLine && !detectSection(cleanLine)) {
          summaryLines.push(cleanLine);
        }
        break;

      case 'experience':
        const dateFound = extractDate(cleanLine);
        
        // Check if this is a new job entry (has date or company pattern)
        if (dateFound || cleanLine.includes('|') || cleanLine.match(/^[A-Z][\w\s]+,\s*[A-Z]/i)) {
          // Save previous experience
          if (currentExperience) {
            structure.experience.push(currentExperience);
          }
          
          // Parse the job entry
          let title = '';
          let company = '';
          let location = '';
          let period = dateFound || '';
          
          // Try to parse "Title | Company, Location | Date" format
          if (cleanLine.includes('|')) {
            const parts = cleanLine.split('|').map(p => p.trim());
            if (parts.length >= 2) {
              title = parts[0];
              const companyPart = parts[1];
              
              // Extract company and location
              const companyMatch = companyPart.match(/^([^,]+),?\s*(.*)$/);
              if (companyMatch) {
                company = companyMatch[1].trim();
                location = companyMatch[2].replace(datePatterns[0], '').replace(datePatterns[1], '').replace(datePatterns[2], '').trim();
              } else {
                company = companyPart;
              }
              
              // Get date from last part if exists
              if (parts.length >= 3) {
                period = extractDate(parts[2]) || parts[2];
              }
            }
          } else {
            // Try other formats
            const lineWithoutDate = cleanLine.replace(datePatterns[0], '').replace(datePatterns[1], '').replace(datePatterns[2], '').trim();
            
            // Check for "Title at Company" or "Title - Company" format
            const atMatch = lineWithoutDate.match(/^(.+?)\s+(?:at|@|-)\s+(.+?)(?:,\s*(.+))?$/i);
            if (atMatch) {
              title = atMatch[1];
              company = atMatch[2];
              location = atMatch[3] || '';
            } else {
              title = lineWithoutDate;
            }
          }
          
          // Clean the job title (remove duplicates)
          title = cleanJobTitle(title, company);
          
          currentExperience = {
            title: title || 'Position',
            company: properCapitalize(company),
            location: properCapitalize(location),
            period: period,
            achievements: []
          };
        } else if (currentExperience) {
          // This is an achievement/bullet point
          if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
            const achievement = cleanLine.replace(/^[•\-*]\s*/, '').trim();
            if (achievement && !extractDate(achievement)) {
              currentExperience.achievements.push(achievement);
            }
          } else if (cleanLine && !cleanLine.match(/^[A-Z][a-z]+\s+\d{4}/) && cleanLine.length > 20) {
            // Longer lines without dates are likely achievements
            currentExperience.achievements.push(cleanLine);
          } else if (!currentExperience.title || currentExperience.title === 'Position') {
            // This might be the job title on its own line
            currentExperience.title = cleanJobTitle(cleanLine);
          } else if (!currentExperience.company) {
            // This might be company info
            currentExperience.company = properCapitalize(cleanLine);
          }
        } else {
          // No current experience, this might be starting a new entry
          // Check if it looks like a job title
          if (cleanLine.length > 3 && cleanLine.length < 100 && !cleanLine.includes('@')) {
            currentExperience = {
              title: cleanJobTitle(cleanLine),
              company: '',
              period: '',
              achievements: []
            };
          }
        }
        break;

      case 'education':
        const eduDate = extractDate(cleanLine);
        
        if (eduDate || cleanLine.includes(' - ') || cleanLine.match(/bachelor|master|doctor|degree|diploma|certificate/i)) {
          // Save previous education
          if (currentEducation) {
            structure.education.push(currentEducation);
          }
          
          let degree = '';
          let school = '';
          let period = eduDate || '';
          
          // Parse "Degree - School" or "Degree at School" format
          const eduMatch = cleanLine.match(/^(.+?)\s*[-–—]\s*(.+?)(?:\s*[-|]\s*(.+))?$/);
          if (eduMatch) {
            degree = eduMatch[1].trim();
            school = eduMatch[2].replace(datePatterns[0], '').replace(datePatterns[1], '').replace(datePatterns[2], '').trim();
            if (eduMatch[3] && !period) {
              period = extractDate(eduMatch[3]) || eduMatch[3];
            }
          } else {
            degree = cleanLine.replace(datePatterns[0], '').replace(datePatterns[1], '').replace(datePatterns[2], '').trim();
          }
          
          currentEducation = {
            degree: properCapitalize(degree),
            school: properCapitalize(school),
            period: period
          };
        } else if (currentEducation) {
          // Additional education details
          if (!currentEducation.school && cleanLine.length > 2) {
            currentEducation.school = properCapitalize(cleanLine);
          } else if (!currentEducation.period && extractDate(cleanLine)) {
            currentEducation.period = extractDate(cleanLine) || '';
          } else if (cleanLine.length > 10) {
            currentEducation.details = cleanLine;
          }
        }
        break;

      case 'skills':
        if (cleanLine.toLowerCase().includes('technical') || cleanLine.toLowerCase().includes('programming') || cleanLine.toLowerCase().includes('technologies')) {
          // Next items are technical skills
          const skillsText = cleanLine.replace(/^[^:]+:\s*/, '');
          if (skillsText) {
            structure.skills.technical.push(...skillsText.split(/[,;]/).map(s => s.trim()).filter(s => s));
          }
        } else if (cleanLine.toLowerCase().includes('soft') || cleanLine.toLowerCase().includes('interpersonal')) {
          const skillsText = cleanLine.replace(/^[^:]+:\s*/, '');
          if (skillsText) {
            structure.skills.soft.push(...skillsText.split(/[,;]/).map(s => s.trim()).filter(s => s));
          }
        } else if (cleanLine.toLowerCase().includes('language')) {
          const skillsText = cleanLine.replace(/^[^:]+:\s*/, '');
          if (skillsText) {
            structure.skills.languages?.push(...skillsText.split(/[,;]/).map(s => s.trim()).filter(s => s));
          }
        } else if (cleanLine.includes(':')) {
          // Generic "Category: skills" format
          const [category, skills] = cleanLine.split(':');
          const skillList = skills?.split(/[,;]/).map(s => s.trim()).filter(s => s) || [];
          
          if (category.toLowerCase().includes('language')) {
            structure.skills.languages?.push(...skillList);
          } else if (skillList.some(s => /javascript|python|react|sql|aws|html|css|java|node/i.test(s))) {
            structure.skills.technical.push(...skillList);
          } else {
            structure.skills.soft.push(...skillList);
          }
        } else if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
          // Bullet point skills
          const skill = cleanLine.replace(/^[•\-*]\s*/, '').trim();
          if (skill) {
            // Categorize based on content
            if (/javascript|python|react|sql|aws|html|css|java|node|typescript|git|docker|kubernetes/i.test(skill)) {
              structure.skills.technical.push(skill);
            } else if (/english|french|spanish|german|chinese|arabic|swahili|kinyarwanda/i.test(skill)) {
              structure.skills.languages?.push(skill);
            } else {
              structure.skills.soft.push(skill);
            }
          }
        } else if (cleanLine.length > 2 && !detectSection(cleanLine)) {
          // Plain text skills - try to categorize
          const skills = cleanLine.split(/[,;]/).map(s => s.trim()).filter(s => s);
          for (const skill of skills) {
            if (/javascript|python|react|sql|aws|html|css|java|node|typescript|git|docker|kubernetes|frontend|backend|database/i.test(skill)) {
              structure.skills.technical.push(skill);
            } else if (/english|french|spanish|german|chinese|arabic|swahili|kinyarwanda/i.test(skill)) {
              structure.skills.languages?.push(skill);
            } else if (skill.length > 2) {
              structure.skills.soft.push(skill);
            }
          }
        }
        break;
    }
  }

  // Save any remaining items
  if (currentExperience) {
    structure.experience.push(currentExperience);
  }
  if (currentEducation) {
    structure.education.push(currentEducation);
  }
  
  structure.summary = summaryLines.join(' ').trim();

  // Deduplicate skills
  structure.skills.technical = [...new Set(structure.skills.technical)];
  structure.skills.soft = [...new Set(structure.skills.soft)];
  structure.skills.languages = [...new Set(structure.skills.languages || [])];

  // If no skills categorized, create defaults based on common patterns
  if (structure.skills.technical.length === 0 && structure.skills.soft.length === 0) {
    // Add default professional skills based on experience
    structure.skills.soft = ['Leadership', 'Strategic Planning', 'Team Management', 'Communication', 'Problem Solving'];
  }

  return structure;
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
    sideY += 7;

    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);

    if (structure.skills.technical.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Technical:', margin, sideY);
      sideY += 5;
      doc.setFont('helvetica', 'normal');
      structure.skills.technical.forEach(skill => {
        doc.text('• ' + skill, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
        sideY += 4;
      });
      sideY += 3;
    }

    if (structure.skills.soft.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Professional:', margin, sideY);
      sideY += 5;
      doc.setFont('helvetica', 'normal');
      structure.skills.soft.forEach(skill => {
        doc.text('• ' + skill, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
        sideY += 4;
      });
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

  // EDUCATION Section
  if (structure.education.length > 0) {
    sideY += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('EDUCATION', margin, sideY);
    sideY += 7;

    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);

    for (const edu of structure.education) {
      doc.setFont('helvetica', 'bold');
      const degreeLines = doc.splitTextToSize(edu.degree, sidebarWidth - margin - 5);
      doc.text(degreeLines, margin, sideY);
      sideY += degreeLines.length * 4;

      doc.setFont('helvetica', 'normal');
      if (edu.school) {
        doc.text(edu.school, margin, sideY, { maxWidth: sidebarWidth - margin - 5 });
        sideY += 4;
      }
      if (edu.period) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(edu.period, margin, sideY);
        doc.setFontSize(9);
        sideY += 4;
      }
      sideY += 4;
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
    yPos += 1;
    
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(mainX, yPos, mainX + 50, yPos);
    yPos += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const summaryLines = doc.splitTextToSize(structure.summary, mainWidth);
    doc.text(summaryLines, mainX, yPos);
    yPos += summaryLines.length * 4 + 6;
  }

  // PROFESSIONAL EXPERIENCE
  if (structure.experience.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('PROFESSIONAL EXPERIENCE', mainX, yPos);
    yPos += 1;
    
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(mainX, yPos, mainX + 55, yPos);
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
      yPos += 4;

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
      doc.setTextColor(60, 60, 60);
      for (const achievement of exp.achievements) {
        if (yPos > pageHeight - 15) {
          doc.addPage();
          drawSidebarBackground();
          yPos = 20;
        }

        const bulletText = '• ' + achievement;
        const achLines = doc.splitTextToSize(bulletText, mainWidth - 3);
        doc.text(achLines, mainX, yPos);
        yPos += achLines.length * 4 + 1;
      }
      yPos += 4;
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
      doc.text('Technical Skills: ', margin, yPos);
      doc.setFont('times', 'normal');
      const techText = structure.skills.technical.join(', ');
      const techLines = doc.splitTextToSize(techText, pageWidth - 2 * margin - 30);
      doc.text(techLines, margin + 30, yPos);
      yPos += techLines.length * 4 + 4;
    }

    if (structure.skills.soft.length > 0) {
      doc.setFont('times', 'bold');
      doc.text('Professional Skills: ', margin, yPos);
      doc.setFont('times', 'normal');
      const softText = structure.skills.soft.join(', ');
      const softLines = doc.splitTextToSize(softText, pageWidth - 2 * margin - 35);
      doc.text(softLines, margin + 35, yPos);
      yPos += softLines.length * 4 + 4;
    }

    if (structure.skills.languages && structure.skills.languages.length > 0) {
      doc.setFont('times', 'bold');
      doc.text('Languages: ', margin, yPos);
      doc.setFont('times', 'normal');
      doc.text(structure.skills.languages.join(', '), margin + 25, yPos);
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
    
    const skillsText = allSkills.join(', ');
    const lines = doc.splitTextToSize(skillsText, pageWidth - 2 * margin);
    doc.text(lines, margin, yPos);
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
                  text: 'Technical Skills: ',
                  bold: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
                new TextRun({
                  text: structure.skills.technical.join(', '),
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
            }),
          ] : []),
          ...(structure.skills.soft.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Professional Skills: ',
                  bold: true,
                  size: 22,
                  font: 'Times New Roman',
                }),
                new TextRun({
                  text: structure.skills.soft.join(', '),
                  size: 22,
                  font: 'Times New Roman',
                }),
              ],
            }),
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
          new Paragraph({
            children: [
              new TextRun({
                text: [
                  ...structure.skills.technical,
                  ...structure.skills.soft,
                  ...(structure.skills.languages || []),
                ].join(', '),
                size: 22,
              }),
            ],
          }),
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
