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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('intelligentqa_theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-[#FFFFFF] font-sans antialiased selection:bg-[#81FF89] selection:text-black transition-colors duration-150">
        <AppShell>{children}</AppShell>
        {/* Pre-Signup Guidance & Ask AI floating widget */}
        <AskAIWidget />
      </body>
    </html>
  );
}
