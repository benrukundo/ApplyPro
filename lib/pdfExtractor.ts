import * as pdfjsLib from 'pdfjs-dist';

// Disable worker - use single-threaded mode (simpler and works everywhere)
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load PDF document without worker
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let lastY = -1;
      let pageText = '';

      for (const item of textContent.items) {
        if ('str' in item && item.str) {
          // Add newline when Y position changes significantly (new line)
          if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 5) {
            pageText += '\n';
          }
          pageText += item.str + ' ';
          lastY = item.transform[5];
        }
      }

      textParts.push(pageText.trim());
    }

    return textParts.join('\n\n');
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}
