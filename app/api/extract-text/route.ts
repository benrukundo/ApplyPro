import { NextRequest, NextResponse } from 'next/server';

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
      // Use pdf-parse for server-side PDF extraction
      const pdfParse = require('pdf-parse') as any;
      const data = await pdfParse(buffer);
      text = data.text;

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
        { error: 'Could not extract text from file.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, text });

  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process file: ' + error.message },
      { status: 500 }
    );
  }
}
