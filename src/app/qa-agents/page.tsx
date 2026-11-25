import QAAgentsWorkspace from '@/components/qa-agents/qa-agents-workspace';
import AuthGuard from '@/components/auth/auth-guard';

export const metadata = {
  title: 'QA Agents Suite | IntelligentQA',
  description:
    '5 autonomous SDET agents: Requirement Generator, Test Case Generator, Automation Code Generator, Code Reviewer & Quality Auditor, and Senior SDET Mentor.',
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
