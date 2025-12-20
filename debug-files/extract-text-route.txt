import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';

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
      // Use unpdf - works in Node.js/serverless without browser APIs
      const uint8Array = new Uint8Array(buffer);
      const result = await extractText(uint8Array);
      text = Array.isArray(result.text) ? result.text.join('\n') : result.text;

    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use PDF, DOCX, or TXT.' },
        { status: 400 }
      );
    }

    // Clean text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();

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
