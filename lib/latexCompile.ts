/**
 * LaTeX Compile Helper
 * Calls the LaTeX.Online API (latex.ytotech.com) to compile LaTeX source to PDF.
 * Falls back to latexonline.cc if the primary API fails.
 */

const DEFAULT_COMPILE_URL = 'https://latex.ytotech.com/builds/sync';
const FALLBACK_COMPILE_URL = 'https://latexonline.cc/compile';
const COMPILE_TIMEOUT_MS = 60_000; // 60 second timeout

export interface CompileResult {
  success: boolean;
  pdfBuffer?: ArrayBuffer;
  error?: string;
}

/**
 * Compile LaTeX via the primary API (latex.ytotech.com POST JSON API)
 */
async function compileViaPrimary(
  latexCode: string,
  compileUrl: string
): Promise<CompileResult> {
  const response = await fetch(compileUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [{ main: true, content: latexCode }],
    }),
    signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    return {
      success: false,
      error: `LaTeX compilation failed (HTTP ${response.status}): ${errorText.substring(0, 300)}`,
    };
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('application/pdf')) {
    const body = await response.text().catch(() => '');
    return {
      success: false,
      error: `Unexpected response type: ${contentType}. ${body.substring(0, 300)}`,
    };
  }

  const pdfBuffer = await response.arrayBuffer();
  return { success: true, pdfBuffer };
}

/**
 * Compile LaTeX via the fallback API (latexonline.cc GET API)
 */
async function compileViaFallback(
  latexCode: string
): Promise<CompileResult> {
  const encoded = encodeURIComponent(latexCode);
  const url = `${FALLBACK_COMPILE_URL}?text=${encoded}`;

  const response = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    return {
      success: false,
      error: `Fallback compilation failed (HTTP ${response.status}): ${errorText.substring(0, 300)}`,
    };
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('application/pdf')) {
    const body = await response.text().catch(() => '');
    return {
      success: false,
      error: `Fallback unexpected response: ${contentType}. ${body.substring(0, 300)}`,
    };
  }

  const pdfBuffer = await response.arrayBuffer();
  return { success: true, pdfBuffer };
}

/**
 * Main compile function — tries primary API first, then fallback
 */
export async function compileLatex(
  latexCode: string,
  compileUrl?: string
): Promise<CompileResult> {
  const url = compileUrl || process.env.LATEX_COMPILE_URL || DEFAULT_COMPILE_URL;

  try {
    // Try primary API (latex.ytotech.com)
    const primaryResult = await compileViaPrimary(latexCode, url);
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn('[LaTeX] Primary API failed, trying fallback...', primaryResult.error);

    // Try fallback API (latexonline.cc)
    try {
      const fallbackResult = await compileViaFallback(latexCode);
      if (fallbackResult.success) {
        return fallbackResult;
      }
      // Both failed — return primary error (more detailed)
      return primaryResult;
    } catch {
      // Fallback also failed — return primary error
      return primaryResult;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Check for timeout
    if (message.includes('abort') || message.includes('timeout') || message.includes('TimeoutError')) {
      return {
        success: false,
        error: 'LaTeX compilation timed out. The document may be too complex or the API is under heavy load. Try opening in Overleaf instead.',
      };
    }

    return {
      success: false,
      error: `Network error: ${message}`,
    };
  }
}
