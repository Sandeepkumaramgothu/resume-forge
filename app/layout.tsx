import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ResumeForge AI — AI-Powered Resume & Cover Letter Generator',
  description:
    'Generate tailored LaTeX resumes and cover letters optimized for ATS using GPT-4o. Paste a job description and get a professionally crafted, downloadable PDF in seconds.',
  keywords: [
    'resume generator',
    'cover letter',
    'AI resume',
    'LaTeX resume',
    'ATS optimized',
    'GPT-4',
    'job application',
  ],
  authors: [{ name: 'Sandeep Kumar Amgothu' }],
  openGraph: {
    title: 'ResumeForge AI',
    description: 'AI-Powered Resume & Cover Letter Generator',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-geist-sans)',
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
