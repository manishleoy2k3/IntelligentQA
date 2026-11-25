import QAAgentsWorkspace from '@/components/qa-agents/qa-agents-workspace';
import AuthGuard from '@/components/auth/auth-guard';

export const metadata = {
  title: 'QA Agents Suite | IntelligentQA',
  description:
    'Autonomous QA Agents Suite: Requirement Analyzer, Test Case Generator, Automation Code Generator, Code Reviewer & Quality Auditor, Senior SDET Mentor, and Test Coverage Gap Analysis Engine.',
};

export default function QAAgentsPage() {
  return (
    <AuthGuard
      featureName="Autonomous QA Agents Suite"
      description="Sign in to generate Gherkin BDD criteria, synthesize test matrices, scaffold Page Object Models, and audit automation code."
    >
      <QAAgentsWorkspace />
    </AuthGuard>
  );
}
