// Improved document generation utilities for PDF and DOCX
// Place this in lib/documentGenerator.ts

import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign, TableLayoutType } from 'docx';
import { saveAs } from 'file-saver';

// Color presets matching the templates page
export const colorPresets = {
  blue: { name: "Blue", hex: "#2563eb", rgb: [37, 99, 235] as [number, number, number], light: [239, 246, 255] as [number, number, number] },
  green: { name: "Green", hex: "#16a34a", rgb: [22, 163, 74] as [number, number, number], light: [240, 253, 244] as [number, number, number] },
  purple: { name: "Purple", hex: "#9333ea", rgb: [147, 51, 234] as [number, number, number], light: [250, 245, 255] as [number, number, number] },
  red: { name: "Red", hex: "#dc2626", rgb: [220, 38, 38] as [number, number, number], light: [254, 242, 242] as [number, number, number] },
  teal: { name: "Teal", hex: "#0d9488", rgb: [13, 148, 136] as [number, number, number], light: [240, 253, 250] as [number, number, number] },
  orange: { name: "Orange", hex: "#ea580c", rgb: [234, 88, 12] as [number, number, number], light: [255, 247, 237] as [number, number, number] },
};

export type ColorPreset = keyof typeof colorPresets;

interface ParsedResume {
  name: string;
  title: string;
  contact: string[];
  summary: string;
  skills: string[];
  education: string[];
  certifications: string[];
  experience: Array<{
    title: string;
    company: string;
    period: string;
    achievements: string[];
  }>;
  additional: string[];
}

/**
 * Parse resume text into structured data
 */
function parseResumeToStructure(content: string): ParsedResume {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const result: ParsedResume = {
    name: '',
    title: '',
    contact: [],
    summary: '',
    skills: [],
    education: [],
    certifications: [],
    experience: [],
    additional: [],
  };

  let currentSection = '';
  let currentExperience: { title: string; company: string; period: string; achievements: string[] } | null = null;
  let foundName = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/^#+\s*/, '').trim();
    
    // Skip empty lines
    if (!cleanLine) continue;

    // Detect section headers (## SECTION NAME or ALL CAPS)
    const isHeader = line.startsWith('#') || (cleanLine === cleanLine.toUpperCase() && cleanLine.length > 2 && cleanLine.length < 60 && !cleanLine.match(/^\d/) && !cleanLine.includes('@'));
    
    if (isHeader) {
      const headerLower = cleanLine.toLowerCase();
      
      // Save current experience if exists
      if (currentExperience && currentExperience.title) {
        result.experience.push(currentExperience);
        currentExperience = null;
      }

      // First header is usually the name
      if (!foundName && !headerLower.includes('summary') && !headerLower.includes('experience') && 
          !headerLower.includes('skill') && !headerLower.includes('education') && !headerLower.includes('contact')) {
        result.name = cleanLine;
        foundName = true;
        continue;
      }

      // Second non-section header could be title
      if (foundName && !result.title && !headerLower.includes('summary') && !headerLower.includes('experience') && 
          !headerLower.includes('skill') && !headerLower.includes('education') && !headerLower.includes('contact') &&
          !headerLower.includes('competen') && !headerLower.includes('certif') && !headerLower.includes('qualif')) {
        result.title = cleanLine;
        continue;
      }

      // Identify section type
      if (headerLower.includes('summary') || headerLower.includes('profile') || headerLower.includes('objective')) {
        currentSection = 'summary';
      } else if (headerLower.includes('skill') || headerLower.includes('competen') || headerLower.includes('technical')) {
        currentSection = 'skills';
      } else if (headerLower.includes('experience') || headerLower.includes('employment') || headerLower.includes('work history')) {
        currentSection = 'experience';
      } else if (headerLower.includes('education')) {
        currentSection = 'education';
      } else if (headerLower.includes('certif') || headerLower.includes('training')) {
        currentSection = 'certifications';
      } else if (headerLower.includes('contact')) {
        currentSection = 'contact';
      } else if (headerLower.includes('additional') || headerLower.includes('qualif') || headerLower.includes('other')) {
        currentSection = 'additional';
      }
      continue;
    }

    // Check for contact info anywhere
    if (cleanLine.includes('@') && cleanLine.includes('.')) {
      result.contact.push(cleanLine.replace(/^(Email|E-mail):\s*/i, ''));
      continue;
    }
    if (cleanLine.match(/^(\+?\d[\d\s\-()]{8,}|\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})$/)) {
      result.contact.push(cleanLine.replace(/^(Phone|Tel):\s*/i, ''));
      continue;
    }
    if (cleanLine.toLowerCase().includes('linkedin.com') || cleanLine.toLowerCase().includes('github.com')) {
      result.contact.push(cleanLine.replace(/^(LinkedIn|GitHub):\s*/i, ''));
      continue;
    }
    if (cleanLine.toLowerCase().startsWith('phone:') || cleanLine.toLowerCase().startsWith('email:') || 
        cleanLine.toLowerCase().startsWith('linkedin:')) {
      result.contact.push(cleanLine);
      continue;
    }

    // Process content based on current section
    const bulletContent = cleanLine.replace(/^[-•*–]\s*/, '');
    const isBullet = cleanLine.startsWith('-') || cleanLine.startsWith('•') || cleanLine.startsWith('*') || cleanLine.startsWith('–');

    switch (currentSection) {
      case 'summary':
        if (isBullet) {
          result.summary += (result.summary ? ' ' : '') + bulletContent;
        } else {
          result.summary += (result.summary ? ' ' : '') + cleanLine;
        }
        break;

      case 'skills':
        if (isBullet) {
          result.skills.push(bulletContent);
        } else if (cleanLine.includes(',')) {
          result.skills.push(...cleanLine.split(',').map(s => s.trim()).filter(s => s));
        } else {
          result.skills.push(cleanLine);
        }
        break;

      case 'education':
        if (isBullet) {
          result.education.push(bulletContent);
        } else {
          result.education.push(cleanLine);
        }
        break;

      case 'certifications':
        if (isBullet) {
          result.certifications.push(bulletContent);
        } else {
          result.certifications.push(cleanLine);
        }
        break;

      case 'additional':
        if (isBullet) {
          result.additional.push(bulletContent);
        } else {
          result.additional.push(cleanLine);
        }
        break;

      case 'experience':
        // Check if this is a job title line (contains | or date pattern)
        const hasDate = /\d{4}\s*[-–]\s*(\d{4}|Present|Current)/i.test(cleanLine);
        const hasPipe = cleanLine.includes('|');
        
        if ((hasDate || hasPipe) && !isBullet) {
          // Save previous experience
          if (currentExperience && currentExperience.title) {
            result.experience.push(currentExperience);
          }
          
          // Parse job info
          const parts = cleanLine.split('|').map(p => p.trim());
          const periodMatch = cleanLine.match(/(\w+\s+\d{4}\s*[-–]\s*(?:\w+\s+\d{4}|Present|Current)|\d{4}\s*[-–]\s*(?:\d{4}|Present|Current))/i);
          
          currentExperience = {
            title: parts[0] || '',
            company: parts.length > 1 ? parts[1].replace(/\d{4}.*$/, '').trim() : '',
            period: periodMatch ? periodMatch[1] : '',
            achievements: [],
          };
        } else if (isBullet && currentExperience) {
          currentExperience.achievements.push(bulletContent);
        } else if (!isBullet && cleanLine.length > 3 && !currentExperience) {
          // This might be a job title on its own line
          currentExperience = {
            title: cleanLine,
            company: '',
            period: '',
            achievements: [],
          };
        } else if (!isBullet && currentExperience && !currentExperience.company && cleanLine.length > 3) {
          // This might be company info
          const periodMatch = cleanLine.match(/(\w+\s+\d{4}\s*[-–]\s*(?:\w+\s+\d{4}|Present|Current)|\d{4}\s*[-–]\s*(?:\d{4}|Present|Current))/i);
          if (periodMatch) {
            currentExperience.company = cleanLine.replace(periodMatch[1], '').replace(/\|/g, '').trim();
            currentExperience.period = periodMatch[1];
          } else {
            currentExperience.company = cleanLine;
          }
        }
        break;

      case 'contact':
        result.contact.push(cleanLine);
        break;
    }
  }

  // Save last experience
  if (currentExperience && currentExperience.title) {
    result.experience.push(currentExperience);
  }

  return result;
}

/**
 * Generate a professionally formatted PDF
 */
export async function generatePDF(
  content: string,
  filename: string,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  colorKey: ColorPreset = 'blue'
): Promise<void> {
  console.log('generatePDF called with template:', template, 'color:', colorKey);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const selectedColor = colorPresets[colorKey] || colorPresets.blue;

  if (template === 'modern') {
    generateModernPDF(doc, content, selectedColor, pageWidth, pageHeight, margin);
  } else {
    generateSingleColumnPDF(doc, content, template, selectedColor, pageWidth, pageHeight, margin);
  }

  doc.save(filename);
}

/**
 * Generate Modern two-column PDF
 */
function generateModernPDF(
  doc: jsPDF,
  content: string,
  selectedColor: { rgb: [number, number, number]; light: [number, number, number]; hex: string },
  pageWidth: number,
  pageHeight: number,
  margin: number
): void {
  console.log('generateModernPDF - Input text length:', content.length);

  const sidebarWidth = 65;
  const rightColumnX = sidebarWidth + 10;
  const rightColumnWidth = pageWidth - rightColumnX - margin;

  // Parse resume into sections
  const lines = content.split('\n').filter(line => line.trim());

  // Extract name (first non-empty line)
  const name = lines[0] || 'Name';
  const title = lines[1] || '';

  console.log('Parsed name:', name);
  console.log('Parsed title:', title);

  // Section detection
  const sections: { [key: string]: string[] } = {
    contact: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    other: []
  };

  let currentSection = 'other';

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineLower = line.toLowerCase();

    // Detect section headers (lines that are all caps or end with ":")
    if (
      lineLower.includes('contact') ||
      lineLower === 'email:' ||
      line.match(/^(email|phone|linkedin|location|address)/i)
    ) {
      currentSection = 'contact';
    } else if (
      lineLower.includes('summary') ||
      lineLower.includes('profile') ||
      lineLower.includes('objective')
    ) {
      currentSection = 'summary';
    } else if (
      lineLower.includes('experience') ||
      lineLower.includes('employment') ||
      lineLower.includes('work history')
    ) {
      currentSection = 'experience';
    } else if (
      lineLower.includes('education') ||
      lineLower.includes('academic')
    ) {
      currentSection = 'education';
    } else if (
      lineLower.includes('skill') ||
      lineLower.includes('competenc') ||
      lineLower.includes('technical expertise') ||
      lineLower.includes('technologies')
    ) {
      currentSection = 'skills';
    } else if (
      lineLower.includes('certification') ||
      lineLower.includes('certificate') ||
      lineLower.includes('license')
    ) {
      currentSection = 'certifications';
    }

    sections[currentSection].push(line);
  }

  console.log('Parsed sections:', Object.keys(sections).map(k => `${k}: ${sections[k].length} lines`));

  // Draw colored sidebar
  doc.setFillColor(selectedColor.light[0], selectedColor.light[1], selectedColor.light[2]);
  doc.rect(0, 0, sidebarWidth, pageHeight, 'F');

  // Draw accent bar at top
  doc.setFillColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // LEFT SIDEBAR CONTENT
  let leftY = 20;

  // Contact section in sidebar
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
  doc.text('CONTACT', 5, leftY);
  leftY += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  sections.contact.forEach(line => {
    const cleanLine = line.replace(/^(email|phone|linkedin|location|address):\s*/i, '');
    if (cleanLine && !line.toLowerCase().includes('contact information')) {
      const wrapped = doc.splitTextToSize(cleanLine, sidebarWidth - 10);
      wrapped.forEach((wLine: string) => {
        if (leftY < pageHeight - 20) {
          doc.text(wLine, 5, leftY);
          leftY += 4;
        }
      });
    }
  });

  leftY += 8;

  // Skills section in sidebar
  if (sections.skills.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('SKILLS', 5, leftY);
    leftY += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    sections.skills.forEach(line => {
      if (!line.toLowerCase().includes('skill') && !line.toLowerCase().includes('competenc')) {
        const cleanLine = line.replace(/^[-•]\s*/, '');
        const wrapped = doc.splitTextToSize(cleanLine, sidebarWidth - 10);
        wrapped.forEach((wLine: string) => {
          if (leftY < pageHeight - 20) {
            doc.text('• ' + wLine, 5, leftY);
            leftY += 4;
          }
        });
      }
    });

    leftY += 8;
  }

  // Education in sidebar
  if (sections.education.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('EDUCATION', 5, leftY);
    leftY += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    sections.education.forEach(line => {
      if (!line.toLowerCase().includes('education')) {
        const wrapped = doc.splitTextToSize(line, sidebarWidth - 10);
        wrapped.forEach((wLine: string) => {
          if (leftY < pageHeight - 20) {
            doc.text(wLine, 5, leftY);
            leftY += 4;
          }
        });
      }
    });

    leftY += 8;
  }

  // Certifications in sidebar
  if (sections.certifications.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('CERTIFICATIONS', 5, leftY);
    leftY += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    sections.certifications.forEach(line => {
      if (!line.toLowerCase().includes('certification')) {
        const wrapped = doc.splitTextToSize(line, sidebarWidth - 10);
        wrapped.forEach((wLine: string) => {
          if (leftY < pageHeight - 20) {
            doc.text(wLine, 5, leftY);
            leftY += 4;
          }
        });
      }
    });
  }

  // RIGHT COLUMN CONTENT
  let rightY = 20;

  // Name
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
  doc.text(name, rightColumnX, rightY);
  rightY += 8;

  // Title
  if (title) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(title, rightColumnX, rightY);
    rightY += 10;
  }

  // Summary section
  if (sections.summary.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('PROFESSIONAL SUMMARY', rightColumnX, rightY);
    rightY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const summaryText = sections.summary
      .filter(line => !line.toLowerCase().includes('summary') && !line.toLowerCase().includes('profile'))
      .join(' ');

    const wrapped = doc.splitTextToSize(summaryText, rightColumnWidth);
    wrapped.forEach((line: string) => {
      if (rightY < pageHeight - 20) {
        doc.text(line, rightColumnX, rightY);
        rightY += 4;
      }
    });

    rightY += 8;
  }

  // Experience section
  if (sections.experience.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('PROFESSIONAL EXPERIENCE', rightColumnX, rightY);
    rightY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    sections.experience.forEach(line => {
      if (!line.toLowerCase().includes('experience') && !line.toLowerCase().includes('employment')) {
        // Check if it's a job title/company (usually contains dates or is bold-worthy)
        const isJobTitle = line.match(/\d{4}/) || line.includes('|') || line.includes(' - ');

        if (isJobTitle) {
          doc.setFont('helvetica', 'bold');
          rightY += 2;
        } else {
          doc.setFont('helvetica', 'normal');
        }

        const wrapped = doc.splitTextToSize(line.replace(/^[-•]\s*/, ''), rightColumnWidth);
        wrapped.forEach((wLine: string) => {
          if (rightY < pageHeight - 20) {
            const prefix = line.startsWith('-') || line.startsWith('•') ? '• ' : '';
            doc.text(prefix + wLine, rightColumnX, rightY);
            rightY += 4;
          }
        });

        doc.setFont('helvetica', 'normal');
      }
    });
  }

  console.log('generateModernPDF completed');
}

/**
 * Generate single-column PDF for Traditional and ATS templates
 */
function generateSingleColumnPDF(
  doc: jsPDF,
  content: string,
  template: 'traditional' | 'ats',
  selectedColor: { rgb: [number, number, number]; hex: string },
  pageWidth: number,
  pageHeight: number,
  margin: number
): void {
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 4;

  const parsed = parseResumeToStructure(content);

  // Header
  if (template === 'traditional') {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(parsed.name, pageWidth / 2, y, { align: 'center' });
    y += 7;
    
    if (parsed.title) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(parsed.title, pageWidth / 2, y, { align: 'center' });
      y += 5;
    }

    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    if (parsed.contact.length > 0) {
      doc.setFontSize(8);
      doc.text(parsed.contact.join('  •  '), pageWidth / 2, y, { align: 'center' });
      y += 7;
    }
  } else {
    // ATS format
    doc.setFontSize(13);
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(parsed.name.toUpperCase(), margin, y);
    y += 5;

    if (parsed.title) {
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      doc.text(parsed.title, margin, y);
      y += 5;
    }

    if (parsed.contact.length > 0) {
      doc.setFontSize(9);
      doc.text(parsed.contact.join(' | '), margin, y);
      y += 7;
    }
  }

  // Summary
  if (parsed.summary) {
    y = addSectionHeader(doc, 'PROFESSIONAL SUMMARY', y, margin, maxWidth, template);
    doc.setFontSize(template === 'ats' ? 9 : 9);
    doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(parsed.summary, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + 5;
  }

  // Experience
  if (parsed.experience.length > 0) {
    y = addSectionHeader(doc, 'PROFESSIONAL EXPERIENCE', y, margin, maxWidth, template);
    
    for (const exp of parsed.experience) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(template === 'ats' ? 9 : 10);
      doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(exp.title, margin, y);
      y += 4;

      if (exp.company || exp.period) {
        doc.setFontSize(template === 'ats' ? 9 : 9);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'italic');
        doc.setTextColor(80, 80, 80);
        doc.text([exp.company, exp.period].filter(Boolean).join(' | '), margin, y);
        y += 4;
      }

      doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(template === 'ats' ? 8 : 8);
      for (const ach of exp.achievements.slice(0, 8)) {
        if (y > pageHeight - 12) break;
        const bullet = template === 'ats' ? '- ' : '• ';
        const lines = doc.splitTextToSize(bullet + ach, maxWidth - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 3.5;
      }
      y += 4;
    }
  }

  // Skills
  if (parsed.skills.length > 0 && y < pageHeight - 20) {
    y = addSectionHeader(doc, 'SKILLS', y, margin, maxWidth, template);
    doc.setFontSize(template === 'ats' ? 8 : 8);
    doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const skillText = parsed.skills.join(template === 'ats' ? ', ' : '  •  ');
    const lines = doc.splitTextToSize(skillText, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3.5 + 4;
  }

  // Education
  if (parsed.education.length > 0 && y < pageHeight - 15) {
    y = addSectionHeader(doc, 'EDUCATION', y, margin, maxWidth, template);
    doc.setFontSize(template === 'ats' ? 9 : 9);
    doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    for (const edu of parsed.education) {
      if (y > pageHeight - 10) break;
      doc.text(edu, margin, y);
      y += 4;
    }
    y += 3;
  }

  // Certifications
  if (parsed.certifications.length > 0 && y < pageHeight - 15) {
    y = addSectionHeader(doc, 'CERTIFICATIONS', y, margin, maxWidth, template);
    doc.setFontSize(template === 'ats' ? 8 : 8);
    doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    for (const cert of parsed.certifications) {
      if (y > pageHeight - 10) break;
      doc.text(`• ${cert}`, margin, y);
      y += 3.5;
    }
  }
}

function addSectionHeader(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number,
  maxWidth: number,
  template: 'traditional' | 'ats'
): number {
  doc.setFontSize(template === 'ats' ? 10 : 11);
  doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, margin, y);
  y += 1.5;
  
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + maxWidth, y);
  
  return y + 4;
}

/**
 * Generate a professionally formatted DOCX
 */
export async function generateDOCX(
  content: string,
  filename: string,
  template: 'modern' | 'traditional' | 'ats' = 'modern',
  colorKey: ColorPreset = 'blue'
): Promise<void> {
  const selectedColor = colorPresets[colorKey] || colorPresets.blue;
  const colorHex = selectedColor.hex.replace('#', '');
  const parsed = parseResumeToStructure(content);

  let children: (Paragraph | Table)[] = [];

  if (template === 'modern') {
    children = generateModernDOCX(parsed, colorHex, selectedColor);
  } else {
    children = generateSingleColumnDOCX(parsed, template);
  }

  const doc = new Document({
    sections: [{ 
      properties: { 
        page: { 
          margin: { top: 400, right: 400, bottom: 400, left: 400 } 
        } 
      }, 
      children 
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Generate Modern two-column DOCX
 */
function generateModernDOCX(
  parsed: ParsedResume,
  colorHex: string,
  selectedColor: { light: [number, number, number] }
): (Paragraph | Table)[] {
  const lightHex = rgbToHex(selectedColor.light);
  const leftContent: Paragraph[] = [];
  const rightContent: Paragraph[] = [];

  // Left: Name
  leftContent.push(
    new Paragraph({
      children: [new TextRun({ text: parsed.name, bold: true, size: 32, color: '1a1a1a' })],
      spacing: { after: 80 },
    })
  );

  // Left: Title
  if (parsed.title) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.title, size: 18, color: colorHex })],
        spacing: { after: 120 },
      })
    );
  }

  // Left: Contact
  for (const contact of parsed.contact.slice(0, 5)) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: contact, size: 14, color: '555555' })],
        spacing: { after: 40 },
      })
    );
  }

  // Left: Skills
  if (parsed.skills.length > 0) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'SKILLS', bold: true, size: 18, color: colorHex })],
        spacing: { before: 200, after: 80 },
      })
    );
    for (const skill of parsed.skills.slice(0, 12)) {
      leftContent.push(
        new Paragraph({
          children: [new TextRun({ text: skill, size: 14 })],
          bullet: { level: 0 },
          spacing: { after: 20 },
        })
      );
    }
  }

  // Left: Education
  if (parsed.education.length > 0) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'EDUCATION', bold: true, size: 18, color: colorHex })],
        spacing: { before: 200, after: 80 },
      })
    );
    for (const edu of parsed.education.slice(0, 3)) {
      leftContent.push(
        new Paragraph({
          children: [new TextRun({ text: edu, size: 14 })],
          spacing: { after: 40 },
        })
      );
    }
  }

  // Left: Certifications
  if (parsed.certifications.length > 0) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'CERTIFICATIONS', bold: true, size: 18, color: colorHex })],
        spacing: { before: 200, after: 80 },
      })
    );
    for (const cert of parsed.certifications.slice(0, 4)) {
      leftContent.push(
        new Paragraph({
          children: [new TextRun({ text: cert, size: 14 })],
          bullet: { level: 0 },
          spacing: { after: 20 },
        })
      );
    }
  }

  // Right: Summary
  if (parsed.summary) {
    rightContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 20, color: colorHex })],
        border: { bottom: { color: colorHex, size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { after: 80 },
      })
    );
    rightContent.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.summary, size: 16 })],
        spacing: { after: 160 },
      })
    );
  }

  // Right: Experience
  if (parsed.experience.length > 0) {
    rightContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROFESSIONAL EXPERIENCE', bold: true, size: 20, color: colorHex })],
        border: { bottom: { color: colorHex, size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { after: 80 },
      })
    );

    for (const exp of parsed.experience) {
      rightContent.push(
        new Paragraph({
          children: [new TextRun({ text: exp.title, bold: true, size: 18 })],
          spacing: { before: 120, after: 40 },
        })
      );
      if (exp.company || exp.period) {
        rightContent.push(
          new Paragraph({
            children: [new TextRun({ text: [exp.company, exp.period].filter(Boolean).join(' | '), size: 14, italics: true, color: '777777' })],
            spacing: { after: 40 },
          })
        );
      }
      for (const ach of exp.achievements.slice(0, 6)) {
        rightContent.push(
          new Paragraph({
            children: [new TextRun({ text: ach, size: 15 })],
            bullet: { level: 0 },
            spacing: { after: 20 },
          })
        );
      }
    }
  }

  // Right: Additional
  if (parsed.additional.length > 0) {
    rightContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'ADDITIONAL QUALIFICATIONS', bold: true, size: 20, color: colorHex })],
        border: { bottom: { color: colorHex, size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 160, after: 80 },
      })
    );
    for (const item of parsed.additional.slice(0, 4)) {
      rightContent.push(
        new Paragraph({
          children: [new TextRun({ text: item, size: 15 })],
          bullet: { level: 0 },
          spacing: { after: 20 },
        })
      );
    }
  }

  // Create two-column table
  const table = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: leftContent,
            width: { size: 28, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            shading: { fill: lightHex },
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
          }),
          new TableCell({
            children: rightContent,
            width: { size: 72, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 100, bottom: 100, left: 120, right: 80 },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  return [table];
}

/**
 * Generate single-column DOCX for Traditional and ATS templates
 */
function generateSingleColumnDOCX(
  parsed: ParsedResume,
  template: 'traditional' | 'ats'
): Paragraph[] {
  const children: Paragraph[] = [];
  const font = template === 'ats' ? 'Courier New' : 'Arial';

  // Header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: template === 'ats' ? parsed.name.toUpperCase() : parsed.name,
          bold: true,
          size: template === 'ats' ? 26 : 40,
          font,
        }),
      ],
      alignment: template === 'traditional' ? 'center' : 'left',
      spacing: { after: 80 },
    })
  );

  if (parsed.title) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.title, size: 20, font, color: '666666' })],
        alignment: template === 'traditional' ? 'center' : 'left',
        spacing: { after: 80 },
      })
    );
  }

  // Contact
  if (parsed.contact.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.contact.join(template === 'ats' ? ' | ' : '  •  '), size: 16, font })],
        alignment: template === 'traditional' ? 'center' : 'left',
        spacing: { after: 160 },
      })
    );
  }

  // Divider for traditional
  if (template === 'traditional') {
    children.push(
      new Paragraph({
        border: { bottom: { color: '333333', size: 8, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { after: 160 },
      })
    );
  }

  // Summary
  if (parsed.summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 20, font })],
        border: { bottom: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 160, after: 80 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.summary, size: 18, font })],
        spacing: { after: 160 },
      })
    );
  }

  // Experience
  if (parsed.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROFESSIONAL EXPERIENCE', bold: true, size: 20, font })],
        border: { bottom: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 160, after: 80 },
      })
    );

    for (const exp of parsed.experience) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.title, bold: true, size: 18, font })],
          spacing: { before: 120, after: 40 },
        })
      );
      if (exp.company || exp.period) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: [exp.company, exp.period].filter(Boolean).join(' | '), size: 16, font, italics: true, color: '777777' })],
            spacing: { after: 40 },
          })
        );
      }
      for (const ach of exp.achievements) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: ach, size: 16, font })],
            bullet: { level: 0 },
            spacing: { after: 20 },
          })
        );
      }
    }
  }

  // Skills
  if (parsed.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'SKILLS', bold: true, size: 20, font })],
        border: { bottom: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 160, after: 80 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.skills.join(', '), size: 16, font })],
        spacing: { after: 120 },
      })
    );
  }

  // Education
  if (parsed.education.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'EDUCATION', bold: true, size: 20, font })],
        border: { bottom: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 160, after: 80 },
      })
    );
    for (const edu of parsed.education) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: edu, size: 16, font })],
          spacing: { after: 40 },
        })
      );
    }
  }

  // Certifications
  if (parsed.certifications.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'CERTIFICATIONS', bold: true, size: 20, font })],
        border: { bottom: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 160, after: 80 },
      })
    );
    for (const cert of parsed.certifications) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: cert, size: 16, font })],
          bullet: { level: 0 },
          spacing: { after: 20 },
        })
      );
    }
  }

  return children;
}

// Helper function to convert RGB to hex
function rgbToHex(rgb: [number, number, number]): string {
  return rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate cover letter PDF
 */
export async function generateCoverLetterPDF(
  content: string,
  filename: string,
  colorKey: ColorPreset = 'blue'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const maxWidth = pageWidth - margin * 2;

  const selectedColor = colorPresets[colorKey] || colorPresets.blue;

  // Header line
  doc.setDrawColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, 18, pageWidth - margin, 18);

  let y = 32;

  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(40, 40, 40);

  const paragraphs = content.split('\n\n');

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para.trim(), maxWidth);
    
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 5.5;
    }
    y += 3;
  }

  doc.save(filename);
}

/**
 * Generate cover letter DOCX
 */
export async function generateCoverLetterDOCX(
  content: string,
  filename: string,
  colorKey: ColorPreset = 'blue'
): Promise<void> {
  const selectedColor = colorPresets[colorKey] || colorPresets.blue;
  const colorHex = selectedColor.hex.replace('#', '');

  const paragraphs: Paragraph[] = [
    new Paragraph({
      border: { bottom: { color: colorHex, size: 18, style: BorderStyle.SINGLE, space: 1 } },
      spacing: { after: 350 },
    }),
  ];

  const contentParagraphs = content.split('\n\n').map(
    (para) =>
      new Paragraph({
        children: [new TextRun({ text: para.trim().replace(/\n/g, ' '), size: 22, font: 'Times New Roman' })],
        spacing: { after: 180 },
      })
  );

  paragraphs.push(...contentParagraphs);

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
