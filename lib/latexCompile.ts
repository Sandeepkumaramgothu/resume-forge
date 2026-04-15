/**
 * LaTeX Compile Helper
 * Calls the LaTeX.Online API to compile LaTeX source to PDF.
 */

const DEFAULT_COMPILE_URL = 'https://latex.ytotech.com/builds/sync';

export interface CompileResult {
  success: boolean;
  pdfBuffer?: ArrayBuffer;
  error?: string;
}

export async function compileLatex(
  latexCode: string,
  compileUrl?: string
): Promise<CompileResult> {
  const url = compileUrl || process.env.LATEX_COMPILE_URL || DEFAULT_COMPILE_URL;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'pdflatex',
        resources: [{ main: true, content: latexCode }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `LaTeX compilation failed (HTTP ${response.status}): ${errorText.substring(0, 200)}`,
      };
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('application/pdf')) {
      const body = await response.text().catch(() => '');
      return {
        success: false,
        error: `Unexpected response type: ${contentType}. ${body.substring(0, 200)}`,
      };
    }

    const pdfBuffer = await response.arrayBuffer();
    return { success: true, pdfBuffer };
  } catch (err) {
    return {
      success: false,
      error: `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
