import { NextRequest, NextResponse } from 'next/server';

async function extractPDFText(buffer: Buffer): Promise<string> {
  // Use pdfjs-dist directly without pdf-parse
  // @ts-ignore
  const PDFJS = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const data = new Uint8Array(buffer);

  const doc = await PDFJS.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    verbosity: 0,
  }).promise;

  let fullText = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item: any) => 'str' in item)
      .map((item: any) => item.str)
      .join(' ');

    fullText += pageText + '\n';
  }

  return fullText.trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';

    if (fileName.endsWith('.txt')) {
      text = buffer.toString('utf-8');

    } else if (fileName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;

    } else if (fileName.endsWith('.pdf')) {
      text = await extractPDFText(buffer);

    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use PDF, DOCX, or TXT.' },
        { status: 400 }
      );
    }

    // Clean text
    text = text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'Could not extract text from file. It may be image-based or empty.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      characterCount: text.length,
    });

  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process file: ' + error.message },
      { status: 500 }
    );
  }
}
