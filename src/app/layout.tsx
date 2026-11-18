import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/app-shell';
import AskAIWidget from '@/components/home/ask-ai-widget';

export const metadata: Metadata = {
  title: 'IntelligentQA - Zero-Cost QA Automation & AI Transformation Intelligence Platform',
  description:
    'Transform from Manual QA to high-demand SDET & AI Test Automation Architect. Master Playwright, TypeScript, Selenium, Java, REST Assured, and Testing AI Applications with live in-browser sandboxes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#111111] text-[#FFFFFF] font-sans antialiased selection:bg-[#81FF89] selection:text-black">
        <AppShell>{children}</AppShell>
        {/* Pre-Signup Guidance & Ask AI floating widget */}
        <AskAIWidget />
      </body>
    </html>
  );
}
