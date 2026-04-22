import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/systemPrompt';
import { checkRateLimit, validateJobDescription } from '@/lib/utils';

// Allow up to 60 seconds for GPT-4o generation on Vercel
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    const rateCheck = checkRateLimit(ip, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { jobDescription, apiKey } = body;

    // Validate input
    const validation = validateJobDescription(jobDescription || '');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Determine API key
    const resolvedKey = apiKey || process.env.OPENAI_API_KEY;
    if (!resolvedKey) {
      return NextResponse.json(
        { error: 'No OpenAI API key provided. Please set one in the settings.' },
        { status: 401 }
      );
    }

    const openai = new OpenAI({ apiKey: resolvedKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        {
          role: 'user',
          content: `Here is the job description. Analyze it and generate the complete tailored resume LaTeX, cover letter LaTeX, and email draft as specified.\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from AI. Please try again.' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Handle specific OpenAI errors
    if (message.includes('401') || message.includes('Incorrect API key')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your key and try again.' },
        { status: 401 }
      );
    }
    if (message.includes('429')) {
      return NextResponse.json(
        { error: 'OpenAI rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    if (message.includes('insufficient_quota')) {
      return NextResponse.json(
        { error: 'OpenAI quota exceeded. Please check your billing at platform.openai.com.' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: `AI generation failed: ${message}` },
      { status: 500 }
    );
  }
}
