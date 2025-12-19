import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';

    // Handle different file types
    if (fileName.endsWith('.txt')) {
      // Plain text file
      text = buffer.toString('utf-8');

    } else if (fileName.endsWith('.docx')) {
      // DOCX file
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (docxError) {
        console.error('DOCX extraction error:', docxError);
        return NextResponse.json(
          { error: 'Failed to extract text from DOCX file' },
          { status: 500 }
        );
      }

    } else if (fileName.endsWith('.pdf')) {
      // PDF file - use pdf-parse
      try {
        // @ts-ignore - pdf-parse doesn't have proper type definitions
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } catch (pdfError: any) {
        console.error('PDF extraction error:', pdfError);

        // If pdf-parse fails, return a helpful error
        return NextResponse.json(
          { error: 'Failed to extract text from PDF. Please try uploading a DOCX file instead.' },
          { status: 500 }
        );
      }

    } else if (fileName.endsWith('.doc')) {
      // Old .doc format - not supported
      return NextResponse.json(
        { error: 'Old .doc format is not supported. Please convert to .docx or .pdf' },
        { status: 400 }
      );

    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    // Clean up the extracted text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from file. Please try another file.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      fileName: file.name,
      fileSize: file.size,
      characterCount: text.length,
    });

  } catch (error: any) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process file. Please try another file.' },
      { status: 500 }
    );
  }
}
