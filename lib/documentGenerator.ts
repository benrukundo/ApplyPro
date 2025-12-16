// Improved document generation utilities for PDF and DOCX
// Place this in lib/documentGenerator.ts

import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface ResumeSection {
  type: 'header' | 'section' | 'subsection' | 'bullet' | 'text' | 'divider';
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
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // First line is usually the name (header)
    if (isFirstLine) {
      sections.push({ type: 'header', content: trimmed });
      isFirstLine = false;
      continue;
    }
    
    // Section headers (all caps or followed by colon)
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 50) {
      sections.push({ type: 'section', content: trimmed });
      continue;
    }
    
    // Lines ending with colon are likely section headers
    if (trimmed.endsWith(':') && trimmed.length < 50) {
      sections.push({ type: 'section', content: trimmed.replace(':', '') });
      continue;
    }
    
    // Bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      sections.push({ type: 'bullet', content: trimmed.replace(/^[•\-*]\s*/, '') });
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
  template: 'modern' | 'traditional' | 'ats' = 'modern'
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
  const lineHeight = 6;
  const sectionGap = 8;
  
  // Colors based on template
  const colors = {
    modern: { primary: [41, 98, 255], secondary: [100, 100, 100] },
    traditional: { primary: [0, 0, 0], secondary: [60, 60, 60] },
    ats: { primary: [0, 0, 0], secondary: [80, 80, 80] },
  };
  
  const theme = colors[template];
  const sections = parseResumeContent(content);

  for (const section of sections) {
    // Check for page break
    if (y > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
    }

    switch (section.type) {
      case 'header':
        // Name - large and bold
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
        doc.text(section.content, margin, y);
        y += 10;
        
        // Add line under name for modern template
        if (template === 'modern') {
          doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
        }
        break;

      case 'section':
        // Section header
        y += sectionGap / 2;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
        doc.text(section.content.toUpperCase(), margin, y);
        y += 2;
        
        // Underline for section
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += lineHeight;
        break;

      case 'subsection':
        // Job title / company
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
        const subLines = doc.splitTextToSize(section.content, maxWidth);
        doc.text(subLines, margin, y);
        y += subLines.length * lineHeight;
        break;

      case 'bullet':
        // Bullet point
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const bulletText = `• ${section.content}`;
        const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 5);
        doc.text(bulletLines, margin + 3, y);
        y += bulletLines.length * (lineHeight - 0.5);
        break;

      case 'text':
      default:
        // Regular text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const textLines = doc.splitTextToSize(section.content, maxWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * lineHeight;
        break;
    }
  }

  // Save the PDF
  doc.save(filename);
}

/**
 * Generate a professionally formatted DOCX
 */
export async function generateDOCX(
  content: string,
  filename: string,
  template: 'modern' | 'traditional' | 'ats' = 'modern'
): Promise<void> {
  const sections = parseResumeContent(content);
  const children: Paragraph[] = [];

  for (const section of sections) {
    switch (section.type) {
      case 'header':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                bold: true,
                size: 48, // 24pt
                color: template === 'modern' ? '2962FF' : '000000',
              }),
            ],
            heading: HeadingLevel.TITLE,
            spacing: { after: 200 },
          })
        );
        
        // Add divider for modern template
        if (template === 'modern') {
          children.push(
            new Paragraph({
              border: {
                bottom: {
                  color: '2962FF',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              spacing: { after: 200 },
            })
          );
        }
        break;

      case 'section':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content.toUpperCase(),
                bold: true,
                size: 24, // 12pt
                color: template === 'modern' ? '2962FF' : '000000',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            border: {
              bottom: {
                color: 'CCCCCC',
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
                size: 22, // 11pt
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
                size: 20, // 10pt
              }),
            ],
            bullet: { level: 0 },
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
                size: 20, // 10pt
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
              top: 720, // 0.5 inch
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

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Generate cover letter PDF (simpler formatting)
 */
export async function generateCoverLetterPDF(
  content: string,
  filename: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const maxWidth = pageWidth - (margin * 2);
  
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(40, 40, 40);
  
  const lines = doc.splitTextToSize(content, maxWidth);
  let y = margin;
  const lineHeight = 6;
  
  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
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
  filename: string
): Promise<void> {
  const paragraphs = content.split('\n\n').map(
    (para) =>
      new Paragraph({
        children: [
          new TextRun({
            text: para.replace(/\n/g, ' '),
            size: 22, // 11pt
            font: 'Times New Roman',
          }),
        ],
        spacing: { after: 200 },
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
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
