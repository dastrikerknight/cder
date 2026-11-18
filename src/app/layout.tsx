import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cder - Autonomous AI Software Engineer',
  description: 'Open-source agentic software engineer inspired by Devin & Devika, deployable on Vercel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
