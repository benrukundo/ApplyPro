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
  experience: Array<{
    title: string;
    company: string;
    period: string;
    achievements: string[];
  }>;
  other: Array<{ section: string; items: string[] }>;
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
    experience: [],
    other: [],
  };

  let currentSection = '';
  let currentExperience: { title: string; company: string; period: string; achievements: string[] } | null = null;
  let currentOther: { section: string; items: string[] } | null = null;
  let lineIndex = 0;

  for (const line of lines) {
    // First non-empty line is usually the name
    if (!result.name && lineIndex === 0) {
      result.name = line.replace(/^#+\s*/, '');
      lineIndex++;
      continue;
    }

    // Second line is often the title
    if (!result.title && lineIndex === 1 && !line.includes('@') && !line.includes('|')) {
      result.title = line.replace(/^#+\s*/, '');
      lineIndex++;
      continue;
    }

    lineIndex++;

    // Contact info
    if (line.includes('@') || line.includes('linkedin') || /\+?\d{10,}/.test(line.replace(/\s/g, ''))) {
      result.contact.push(line.replace(/^#+\s*/, ''));
      continue;
    }

    // Section headers
    const cleanLine = line.replace(/^#+\s*/, '').replace(/:$/, '');
    const isSection = (line.startsWith('#') || line === line.toUpperCase()) && line.length < 50;

    if (isSection) {
      const sectionLower = cleanLine.toLowerCase();
      
      if (currentExperience && currentExperience.title) {
        result.experience.push(currentExperience);
        currentExperience = null;
      }
      
      if (currentOther && currentOther.items.length > 0) {
        result.other.push(currentOther);
        currentOther = null;
      }

      if (sectionLower.includes('summary') || sectionLower.includes('objective') || sectionLower.includes('profile')) {
        currentSection = 'summary';
      } else if (sectionLower.includes('skill') || sectionLower.includes('competenc') || sectionLower.includes('technical')) {
        currentSection = 'skills';
      } else if (sectionLower.includes('education') || sectionLower.includes('certification') || sectionLower.includes('qualification')) {
        currentSection = 'education';
      } else if (sectionLower.includes('experience') || sectionLower.includes('employment') || sectionLower.includes('work history')) {
        currentSection = 'experience';
      } else if (sectionLower.includes('contact')) {
        currentSection = 'contact';
      } else {
        currentSection = 'other';
        currentOther = { section: cleanLine, items: [] };
      }
      continue;
    }

    const bulletContent = line.replace(/^[-•*–]\s*/, '');
    const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || line.startsWith('–');

    switch (currentSection) {
      case 'summary':
        result.summary += (result.summary ? ' ' : '') + line.replace(/^#+\s*/, '');
        break;

      case 'skills':
        if (isBullet) {
          result.skills.push(bulletContent);
        } else if (line.includes(',')) {
          result.skills.push(...line.split(',').map(s => s.trim()).filter(s => s));
        } else if (line.includes(':')) {
          const parts = line.split(':');
          if (parts[1]) {
            result.skills.push(...parts[1].split(',').map(s => s.trim()).filter(s => s));
          }
        } else {
          result.skills.push(line.replace(/^#+\s*/, ''));
        }
        break;

      case 'education':
        if (isBullet) {
          result.education.push(bulletContent);
        } else {
          result.education.push(line.replace(/^#+\s*/, ''));
        }
        break;

      case 'experience':
        if (line.includes('|') || /\d{4}\s*[-–]\s*(\d{4}|Present|Current)/i.test(line)) {
          if (currentExperience && currentExperience.title) {
            result.experience.push(currentExperience);
          }
          
          const parts = line.split('|').map(p => p.trim());
          const periodMatch = line.match(/(\d{4}\s*[-–]\s*(?:\d{4}|Present|Current))/i);
          
          currentExperience = {
            title: parts[0]?.replace(/^#+\s*/, '') || '',
            company: parts[1]?.replace(/\d{4}.*$/, '').trim() || '',
            period: periodMatch ? periodMatch[1] : '',
            achievements: [],
          };
        } else if (isBullet && currentExperience) {
          currentExperience.achievements.push(bulletContent);
        } else if (currentExperience && !isBullet && line.length > 10) {
          if (!currentExperience.company) {
            currentExperience.company = line.replace(/^#+\s*/, '');
          }
        } else if (!currentExperience && line.replace(/^#+\s*/, '').length > 3) {
          currentExperience = {
            title: line.replace(/^#+\s*/, ''),
            company: '',
            period: '',
            achievements: [],
          };
        }
        break;

      case 'contact':
        result.contact.push(line.replace(/^#+\s*/, ''));
        break;

      case 'other':
        if (currentOther) {
          if (isBullet) {
            currentOther.items.push(bulletContent);
          } else {
            currentOther.items.push(line.replace(/^#+\s*/, ''));
          }
        }
        break;
    }
  }

  if (currentExperience && currentExperience.title) {
    result.experience.push(currentExperience);
  }
  if (currentOther && currentOther.items.length > 0) {
    result.other.push(currentOther);
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
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
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
  const leftColWidth = 60;
  const rightColStart = margin + leftColWidth + 8;
  const rightColWidth = pageWidth - rightColStart - margin;

  const parsed = parseResumeToStructure(content);

  // Draw left column background with light color
  doc.setFillColor(selectedColor.light[0], selectedColor.light[1], selectedColor.light[2]);
  doc.rect(0, 0, margin + leftColWidth + 4, pageHeight, 'F');

  let leftY = margin + 5;
  let rightY = margin + 5;

  // LEFT COLUMN
  // Name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  const nameLines = doc.splitTextToSize(parsed.name, leftColWidth - 4);
  doc.text(nameLines, margin, leftY);
  leftY += nameLines.length * 7;

  // Title
  if (parsed.title) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    const titleLines = doc.splitTextToSize(parsed.title, leftColWidth - 4);
    doc.text(titleLines, margin, leftY);
    leftY += titleLines.length * 5 + 3;
  }

  // Contact
  if (parsed.contact.length > 0) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    for (const contact of parsed.contact.slice(0, 4)) {
      const contactLines = doc.splitTextToSize(contact, leftColWidth - 4);
      doc.text(contactLines, margin, leftY);
      leftY += contactLines.length * 4;
    }
    leftY += 5;
  }

  // Skills section
  if (parsed.skills.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('SKILLS', margin, leftY);
    leftY += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    for (const skill of parsed.skills.slice(0, 12)) {
      doc.setFillColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
      doc.circle(margin + 2, leftY - 1, 1, 'F');
      
      const skillLines = doc.splitTextToSize(skill, leftColWidth - 10);
      doc.text(skillLines, margin + 6, leftY);
      leftY += skillLines.length * 4;
      
      if (leftY > pageHeight - 40) break;
    }
    leftY += 5;
  }

  // Education section
  if (parsed.education.length > 0 && leftY < pageHeight - 30) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('EDUCATION', margin, leftY);
    leftY += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    for (const edu of parsed.education.slice(0, 4)) {
      const eduLines = doc.splitTextToSize(edu, leftColWidth - 4);
      doc.text(eduLines, margin, leftY);
      leftY += eduLines.length * 4 + 2;
      
      if (leftY > pageHeight - 20) break;
    }
  }

  // RIGHT COLUMN
  // Professional Summary
  if (parsed.summary) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('PROFESSIONAL SUMMARY', rightColStart, rightY);
    rightY += 2;
    
    doc.setDrawColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.setLineWidth(0.5);
    doc.line(rightColStart, rightY, rightColStart + rightColWidth, rightY);
    rightY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const summaryLines = doc.splitTextToSize(parsed.summary, rightColWidth);
    doc.text(summaryLines, rightColStart, rightY);
    rightY += summaryLines.length * 4 + 8;
  }

  // Work Experience
  if (parsed.experience.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.text('WORK EXPERIENCE', rightColStart, rightY);
    rightY += 2;
    
    doc.setDrawColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
    doc.setLineWidth(0.5);
    doc.line(rightColStart, rightY, rightColStart + rightColWidth, rightY);
    rightY += 6;

    for (const exp of parsed.experience) {
      if (rightY > pageHeight - 40) {
        doc.addPage();
        rightY = margin + 5;
        
        // Redraw left column background on new page
        doc.setFillColor(selectedColor.light[0], selectedColor.light[1], selectedColor.light[2]);
        doc.rect(0, 0, margin + 60 + 4, pageHeight, 'F');
      }

      // Timeline dot
      doc.setFillColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
      doc.circle(rightColStart + 2, rightY, 2, 'F');

      // Job title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(exp.title, rightColStart + 8, rightY + 1);
      rightY += 5;

      // Company and period
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const companyLine = [exp.company, exp.period].filter(Boolean).join(' | ');
      doc.text(companyLine, rightColStart + 8, rightY);
      rightY += 5;

      // Achievements
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      for (const achievement of exp.achievements.slice(0, 5)) {
        if (rightY > pageHeight - 15) break;
        
        const achLines = doc.splitTextToSize(`• ${achievement}`, rightColWidth - 10);
        doc.text(achLines, rightColStart + 8, rightY);
        rightY += achLines.length * 4;
      }
      rightY += 4;
    }
  }
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
  const lineHeight = 5;

  const parsed = parseResumeToStructure(content);

  // Header
  if (template === 'traditional') {
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(parsed.name, pageWidth / 2, y, { align: 'center' });
    y += 8;
    
    if (parsed.title) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(parsed.title, pageWidth / 2, y, { align: 'center' });
      y += 6;
    }

    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    if (parsed.contact.length > 0) {
      doc.setFontSize(9);
      doc.text(parsed.contact.join(' • '), pageWidth / 2, y, { align: 'center' });
      y += 8;
    }
  } else {
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(parsed.name.toUpperCase(), margin, y);
    y += 6;

    if (parsed.contact.length > 0) {
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text(parsed.contact.join(' | '), margin, y);
      y += 8;
    }
  }

  // Summary
  if (parsed.summary) {
    y = addSection(doc, 'PROFESSIONAL SUMMARY', y, margin, maxWidth, template);
    doc.setFontSize(template === 'ats' ? 9 : 10);
    doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(parsed.summary, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + 6;
  }

  // Experience
  if (parsed.experience.length > 0) {
    y = addSection(doc, 'WORK EXPERIENCE', y, margin, maxWidth, template);
    
    for (const exp of parsed.experience) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(template === 'ats' ? 9 : 11);
      doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(exp.title, margin, y);
      y += 5;

      doc.setFontSize(template === 'ats' ? 9 : 10);
      doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text([exp.company, exp.period].filter(Boolean).join(' | '), margin, y);
      y += 5;

      doc.setTextColor(40, 40, 40);
      for (const ach of exp.achievements.slice(0, 6)) {
        if (y > pageHeight - 15) break;
        const bullet = template === 'ats' ? '- ' : '• ';
        const lines = doc.splitTextToSize(bullet + ach, maxWidth - 5);
        doc.text(lines, margin + 3, y);
        y += lines.length * 4;
      }
      y += 4;
    }
  }

  // Education
  if (parsed.education.length > 0) {
    y = addSection(doc, 'EDUCATION', y, margin, maxWidth, template);
    doc.setFontSize(template === 'ats' ? 9 : 10);
    doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    for (const edu of parsed.education) {
      doc.text(edu, margin, y);
      y += 5;
    }
    y += 4;
  }

  // Skills
  if (parsed.skills.length > 0) {
    y = addSection(doc, 'SKILLS', y, margin, maxWidth, template);
    doc.setFontSize(template === 'ats' ? 9 : 10);
    doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const skillText = parsed.skills.join(template === 'ats' ? ', ' : ' • ');
    const lines = doc.splitTextToSize(skillText, maxWidth);
    doc.text(lines, margin, y);
  }
}

function addSection(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number,
  maxWidth: number,
  template: 'traditional' | 'ats'
): number {
  doc.setFontSize(template === 'ats' ? 10 : 12);
  doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, margin, y);
  y += 2;
  
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + maxWidth, y);
  
  return y + 5;
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
    children = generateModernDOCX(parsed, colorHex);
  } else {
    children = generateSingleColumnDOCX(parsed, template, colorHex);
  }

  const doc = new Document({
    sections: [{ 
      properties: { 
        page: { 
          margin: { top: 500, right: 500, bottom: 500, left: 500 } 
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
  colorHex: string
): (Paragraph | Table)[] {
  const leftContent: Paragraph[] = [];
  const rightContent: Paragraph[] = [];

  // Left: Name
  leftContent.push(
    new Paragraph({
      children: [new TextRun({ text: parsed.name, bold: true, size: 36, color: '1a1a1a' })],
      spacing: { after: 100 },
    })
  );

  // Left: Title
  if (parsed.title) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.title, size: 20, color: colorHex })],
        spacing: { after: 150 },
      })
    );
  }

  // Left: Contact
  for (const contact of parsed.contact.slice(0, 4)) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: contact, size: 16, color: '666666' })],
        spacing: { after: 50 },
      })
    );
  }

  // Left: Skills
  if (parsed.skills.length > 0) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'SKILLS', bold: true, size: 20, color: colorHex })],
        spacing: { before: 200, after: 100 },
      })
    );
    for (const skill of parsed.skills.slice(0, 10)) {
      leftContent.push(
        new Paragraph({
          children: [new TextRun({ text: skill, size: 16 })],
          bullet: { level: 0 },
          spacing: { after: 30 },
        })
      );
    }
  }

  // Left: Education
  if (parsed.education.length > 0) {
    leftContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'EDUCATION', bold: true, size: 20, color: colorHex })],
        spacing: { before: 200, after: 100 },
      })
    );
    for (const edu of parsed.education) {
      leftContent.push(
        new Paragraph({
          children: [new TextRun({ text: edu, size: 16 })],
          spacing: { after: 50 },
        })
      );
    }
  }

  // Right: Summary
  if (parsed.summary) {
    rightContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 22, color: colorHex })],
        border: { bottom: { color: colorHex, size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { after: 100 },
      })
    );
    rightContent.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.summary, size: 18 })],
        spacing: { after: 200 },
      })
    );
  }

  // Right: Experience
  if (parsed.experience.length > 0) {
    rightContent.push(
      new Paragraph({
        children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true, size: 22, color: colorHex })],
        border: { bottom: { color: colorHex, size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { after: 100 },
      })
    );

    for (const exp of parsed.experience) {
      rightContent.push(
        new Paragraph({
          children: [new TextRun({ text: exp.title, bold: true, size: 20 })],
          spacing: { before: 150, after: 50 },
        })
      );
      rightContent.push(
        new Paragraph({
          children: [new TextRun({ text: [exp.company, exp.period].filter(Boolean).join(' | '), size: 16, color: '888888' })],
          spacing: { after: 50 },
        })
      );
      for (const ach of exp.achievements.slice(0, 5)) {
        rightContent.push(
          new Paragraph({
            children: [new TextRun({ text: ach, size: 18 })],
            bullet: { level: 0 },
            spacing: { after: 30 },
          })
        );
      }
    }
  }

  // Create two-column table
  const table = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: leftContent,
            width: { size: 30, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            shading: { fill: 'f0f7ff' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            children: rightContent,
            width: { size: 70, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.TOP,
            margins: { top: 100, bottom: 100, left: 150, right: 100 },
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
  template: 'traditional' | 'ats',
  colorHex: string
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
          size: template === 'ats' ? 28 : 44,
          font,
        }),
      ],
      alignment: template === 'traditional' ? 'center' : 'left',
      spacing: { after: 100 },
    })
  );

  if (parsed.title && template === 'traditional') {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.title, size: 24, font, color: '666666' })],
        alignment: 'center',
        spacing: { after: 100 },
      })
    );
  }

  // Contact
  if (parsed.contact.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.contact.join(template === 'ats' ? ' | ' : ' • '), size: 18, font })],
        alignment: template === 'traditional' ? 'center' : 'left',
        spacing: { after: 200 },
      })
    );
  }

  // Summary
  if (parsed.summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 22, font })],
        border: { bottom: { color: 'CCCCCC', size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 200, after: 100 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.summary, size: 20, font })],
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  if (parsed.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true, size: 22, font })],
        border: { bottom: { color: 'CCCCCC', size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 200, after: 100 },
      })
    );

    for (const exp of parsed.experience) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.title, bold: true, size: 20, font })],
          spacing: { before: 150, after: 50 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: [exp.company, exp.period].filter(Boolean).join(' | '), size: 18, font, color: '888888' })],
          spacing: { after: 50 },
        })
      );
      for (const ach of exp.achievements) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: ach, size: 18, font })],
            bullet: { level: 0 },
            spacing: { after: 30 },
          })
        );
      }
    }
  }

  // Education
  if (parsed.education.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'EDUCATION', bold: true, size: 22, font })],
        border: { bottom: { color: 'CCCCCC', size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 200, after: 100 },
      })
    );
    for (const edu of parsed.education) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: edu, size: 18, font })],
          spacing: { after: 50 },
        })
      );
    }
  }

  // Skills
  if (parsed.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'SKILLS', bold: true, size: 22, font })],
        border: { bottom: { color: 'CCCCCC', size: 6, style: BorderStyle.SINGLE, space: 1 } },
        spacing: { before: 200, after: 100 },
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.skills.join(', '), size: 18, font })],
        spacing: { after: 100 },
      })
    );
  }

  return children;
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
  doc.line(margin, 20, pageWidth - margin, 20);

  let y = 35;

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
      y += 6;
    }
    y += 4;
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
      spacing: { after: 400 },
    }),
  ];

  const contentParagraphs = content.split('\n\n').map(
    (para) =>
      new Paragraph({
        children: [new TextRun({ text: para.trim().replace(/\n/g, ' '), size: 22, font: 'Times New Roman' })],
        spacing: { after: 200 },
      })
  );

  paragraphs.push(...contentParagraphs);

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
