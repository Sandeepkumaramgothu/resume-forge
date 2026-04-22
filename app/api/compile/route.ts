import { NextRequest, NextResponse } from 'next/server';
import { compileLatex } from '@/lib/latexCompile';

export async function POST(req: NextRequest) {
  try {
    const { latexCode, filename } = await req.json();

    if (!latexCode || typeof latexCode !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid LaTeX code.' },
        { status: 400 }
      );
    }

    const result = await compileLatex(latexCode);

    if (!result.success || !result.pdfBuffer) {
      // Fallback: return info for .tex download
      return NextResponse.json(
        {
          error: result.error || 'Compile failed',
          fallback: true,
          latexCode,
          filename: filename || 'document',
        },
        { status: 422 }
      );
    }

    // Convert ArrayBuffer to Uint8Array for reliable NextResponse handling
    const pdfBytes = new Uint8Array(result.pdfBuffer);
    const safeName = (filename || 'document').replace(/[^a-zA-Z0-9_\-\.]/g, '_');

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
        'Content-Length': String(pdfBytes.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[compile] Error:', message);
    return NextResponse.json(
      { error: `Compilation error: ${message}`, fallback: true },
      { status: 500 }
    );
  }
}
