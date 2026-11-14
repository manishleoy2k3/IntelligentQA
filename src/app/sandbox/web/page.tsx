import WebPlayground from '@/components/sandbox/web-playground';
import AuthGuard from '@/components/auth/auth-guard';

export const metadata = {
  title: 'Web Automation Playground | IntelligentQA',
  description: 'In-browser practice sandbox with Shadow DOM, dynamic AJAX delays, iframes, data tables, and OTP inputs.',
};

export default function WebSandboxPage() {
  return (
    <AuthGuard
      featureName="Web Automation Lab"
      description="Sign in to practice test automation against Shadow DOMs, dynamic delays, segmented OTP inputs, and pagination tables."
    >
      <WebPlayground />
    </AuthGuard>
  );
}
