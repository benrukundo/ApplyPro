// Improved document generation utilities for PDF and DOCX
// Place this in lib/documentGenerator.ts

import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

// Color presets matching the templates page
export const colorPresets = {
  blue: { name: "Blue", hex: "#2563eb", rgb: [37, 99, 235] as [number, number, number] },
  green: { name: "Green", hex: "#16a34a", rgb: [22, 163, 74] as [number, number, number] },
  purple: { name: "Purple", hex: "#9333ea", rgb: [147, 51, 234] as [number, number, number] },
  red: { name: "Red", hex: "#dc2626", rgb: [220, 38, 38] as [number, number, number] },
  teal: { name: "Teal", hex: "#0d9488", rgb: [13, 148, 136] as [number, number, number] },
  orange: { name: "Orange", hex: "#ea580c", rgb: [234, 88, 12] as [number, number, number] },
};

export type ColorPreset = keyof typeof colorPresets;

interface ResumeSection {
  type: 'header' | 'section' | 'subsection' | 'bullet' | 'text' | 'contact' | 'skill';
  content: string;
  bold?: boolean;
}

/**
 * Parse resume text into structured sections
 */
function parseResumeContent(content: string): ResumeSection[] {
  const lines = content.split('\n');
  const sections: ResumeSection[] = [];
  
  let isFirstLine = true;
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // First line is usually the name (header)
    if (isFirstLine) {
      sections.push({ type: 'header', content: trimmed });
      isFirstLine = false;
      continue;
    }
    
    // Contact info (email, phone patterns)
    if (trimmed.includes('@') || /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(trimmed) || 
        (trimmed.includes('|') && (trimmed.includes('@') || trimmed.includes('Phone')))) {
      sections.push({ type: 'contact', content: trimmed });
      continue;
    }
    
    // Section headers (all caps or followed by colon)
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 50 && !/\d/.test(trimmed)) {
      sections.push({ type: 'section', content: trimmed });
      currentSection = trimmed.toLowerCase();
      continue;
    }
    
    // Lines ending with colon are likely section headers
    if (trimmed.endsWith(':') && trimmed.length < 50) {
      const sectionName = trimmed.replace(':', '');
      sections.push({ type: 'section', content: sectionName });
      currentSection = sectionName.toLowerCase();
      continue;
    }
    
    // Bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('–')) {
      sections.push({ type: 'bullet', content: trimmed.replace(/^[•\-*–]\s*/, '') });
      continue;
    }
    
    // Skills (if in skills section and comma-separated or short)
    if (currentSection.includes('skill') && (trimmed.includes(',') || trimmed.length < 30)) {
      sections.push({ type: 'skill', content: trimmed });
      continue;
    }
    
    // Job titles / dates (usually contain pipes or dashes with dates)
    if (trimmed.includes('|') || /\d{4}\s*[-–]\s*(\d{4}|Present|Current)/i.test(trimmed)) {
      sections.push({ type: 'subsection', content: trimmed, bold: true });
      continue;
    }
    
    // Regular text
    sections.push({ type: 'text', content: trimmed });
  }
  
  return sections;
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
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  let y = margin;
  const lineHeight = 5;
  const sectionGap = 8;
  
  // Get color based on template and selection
  const selectedColor = colorPresets[colorKey] || colorPresets.blue;
  
  // Colors based on template
  const colors = {
    modern: { 
      primary: selectedColor.rgb, 
      secondary: [80, 80, 80] as [number, number, number],
      text: [50, 50, 50] as [number, number, number]
    },
    traditional: { 
      primary: [30, 30, 30] as [number, number, number], 
      secondary: [60, 60, 60] as [number, number, number],
      text: [40, 40, 40] as [number, number, number]
    },
    ats: { 
      primary: [0, 0, 0] as [number, number, number], 
      secondary: [60, 60, 60] as [number, number, number],
      text: [30, 30, 30] as [number, number, number]
    },
  };
  
  const theme = colors[template];
  const sections = parseResumeContent(content);

  // Traditional and ATS templates - single column
  for (const section of sections) {
    if (y > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
    }

    switch (section.type) {
      case 'header':
        doc.setFontSize(template === 'ats' ? 14 : 22);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'bold');
        doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
        
        if (template === 'traditional') {
          // Center aligned for traditional
          doc.text(section.content, pageWidth / 2, y, { align: 'center' });
          y += 8;
          doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
          doc.setLineWidth(0.8);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
        } else if (template === 'modern') {
          doc.text(section.content, margin, y);
          y += 8;
          doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
          doc.setLineWidth(0.8);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
        } else {
          doc.text(section.content.toUpperCase(), margin, y);
          y += 6;
        }
        break;

      case 'contact':
        doc.setFontSize(template === 'ats' ? 9 : 10);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
        doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
        
        if (template === 'traditional') {
          doc.text(section.content, pageWidth / 2, y, { align: 'center' });
        } else {
          doc.text(section.content, margin, y);
        }
        y += 5;
        break;

      case 'section':
        y += sectionGap / 2;
        doc.setFontSize(template === 'ats' ? 10 : 12);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'bold');
        doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
        doc.text(section.content.toUpperCase(), margin, y);
        y += 2;
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += lineHeight;
        break;

      case 'subsection':
        doc.setFontSize(template === 'ats' ? 9 : 11);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'bold');
        doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
        const subLines = doc.splitTextToSize(section.content, maxWidth);
        doc.text(subLines, margin, y);
        y += subLines.length * lineHeight;
        break;

      case 'bullet':
        doc.setFontSize(template === 'ats' ? 9 : 10);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
        const bulletText = template === 'ats' ? `- ${section.content}` : `• ${section.content}`;
        const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 5);
        doc.text(bulletLines, margin + 3, y);
        y += bulletLines.length * (lineHeight - 0.5);
        break;

      case 'skill':
        doc.setFontSize(template === 'ats' ? 9 : 10);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
        const skillLines = doc.splitTextToSize(section.content, maxWidth);
        doc.text(skillLines, margin, y);
        y += skillLines.length * lineHeight;
        break;

      case 'text':
      default:
        doc.setFontSize(template === 'ats' ? 9 : 10);
        doc.setFont(template === 'ats' ? 'courier' : 'helvetica', 'normal');
        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
        const textLines = doc.splitTextToSize(section.content, maxWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * lineHeight;
        break;
    }
  }

  doc.save(filename);
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
  const sections = parseResumeContent(content);
  const children: Paragraph[] = [];
  
  // Get color hex (without #)
  const selectedColor = colorPresets[colorKey] || colorPresets.blue;
  const colorHex = selectedColor.hex.replace('#', '');

  for (const section of sections) {
    switch (section.type) {
      case 'header':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: template === 'ats' ? section.content.toUpperCase() : section.content,
                bold: true,
                size: template === 'ats' ? 28 : 48,
                color: template === 'modern' ? colorHex : '000000',
                font: template === 'ats' ? 'Courier New' : 'Arial',
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: template === 'traditional' ? 'center' : 'left',
            spacing: { after: 100 },
          })
        );
        
        if (template === 'modern' || template === 'traditional') {
          children.push(
            new Paragraph({
              border: {
                bottom: {
                  color: template === 'modern' ? colorHex : '000000',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: template === 'modern' ? 12 : 6,
                },
              },
              spacing: { after: 200 },
            })
          );
        }
        break;

      case 'contact':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                size: template === 'ats' ? 18 : 20,
                color: '666666',
                font: template === 'ats' ? 'Courier New' : 'Arial',
              }),
            ],
            alignment: template === 'traditional' ? 'center' : 'left',
            spacing: { after: 100 },
          })
        );
        break;

      case 'section':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content.toUpperCase(),
                bold: true,
                size: template === 'ats' ? 20 : 24,
                color: template === 'modern' ? colorHex : '000000',
                font: template === 'ats' ? 'Courier New' : 'Arial',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            border: {
              bottom: {
                color: template === 'modern' ? colorHex : 'CCCCCC',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          })
        );
        break;

      case 'subsection':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                bold: true,
                size: template === 'ats' ? 18 : 22,
                font: template === 'ats' ? 'Courier New' : 'Arial',
              }),
            ],
            spacing: { before: 150, after: 50 },
          })
        );
        break;

      case 'bullet':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                size: template === 'ats' ? 18 : 20,
                font: template === 'ats' ? 'Courier New' : 'Arial',
              }),
            ],
            bullet: { level: 0 },
            spacing: { after: 50 },
          })
        );
        break;

      case 'skill':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                size: template === 'ats' ? 18 : 20,
                font: template === 'ats' ? 'Courier New' : 'Arial',
              }),
            ],
            spacing: { after: 50 },
          })
        );
        break;

      case 'text':
      default:
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                size: template === 'ats' ? 18 : 20,
                font: template === 'ats' ? 'Courier New' : 'Arial',
              }),
            ],
            spacing: { after: 100 },
          })
        );
        break;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
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
  const maxWidth = pageWidth - (margin * 2);
  
  const selectedColor = colorPresets[colorKey] || colorPresets.blue;
  
  // Add a subtle header line
  doc.setDrawColor(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2]);
  doc.setLineWidth(1);
  doc.line(margin, 15, pageWidth - margin, 15);
  
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(40, 40, 40);
  
  const lines = doc.splitTextToSize(content, maxWidth);
  let y = 30;
  const lineHeight = 6;
  
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
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
    // Header line
    new Paragraph({
      border: {
        bottom: {
          color: colorHex,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      spacing: { after: 400 },
    }),
  ];
  
  // Split content into paragraphs
  const contentParagraphs = content.split('\n\n').map(
    (para) =>
      new Paragraph({
        children: [
          new TextRun({
            text: para.replace(/\n/g, ' '),
            size: 22,
            font: 'Times New Roman',
          }),
        ],
        spacing: { after: 200 },
      })
  );
  
  paragraphs.push(...contentParagraphs);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
