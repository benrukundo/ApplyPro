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
      // PDF file - try multiple methods
      try {
        // Method 1: Try pdf-parse with proper path
        const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } catch (pdfError: any) {
        console.error('PDF extraction method 1 failed:', pdfError);

        // Method 2: Try alternative import
        try {
          const pdf = await import('pdf-parse');
          const pdfParseFn = pdf.default || pdf;
          const pdfData = await pdfParseFn(buffer);
          text = pdfData.text;
        } catch (altError) {
          console.error('PDF extraction method 2 failed:', altError);

          // Method 3: Try pdfjs-dist as last resort
          try {
            const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

            const uint8Array = new Uint8Array(arrayBuffer);
            const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
            const pdfDocument = await loadingTask.promise;

            const textParts: string[] = [];

            for (let i = 1; i <= pdfDocument.numPages; i++) {
              const page = await pdfDocument.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
              textParts.push(pageText);
            }

            text = textParts.join('\n\n');
          } catch (pdfjsError) {
            console.error('PDF extraction method 3 (pdfjs) failed:', pdfjsError);
            return NextResponse.json(
              { error: 'Failed to extract text from PDF. Please try a DOCX or TXT file instead.' },
              { status: 500 }
            );
          }
        }
      }
    } else if (fileName.endsWith('.doc')) {
      // Old .doc format - not fully supported
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
