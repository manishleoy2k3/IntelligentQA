import InterviewGriller from '@/components/interview/interview-griller-modal';
import AuthGuard from '@/components/auth/auth-guard';

export const metadata = {
  title: 'AI SDET Interview Griller | IntelligentQA',
  description:
    'Simulated Lead SDET technical round with probing follow-ups and comprehensive rubric scorecard.',
};

export default function InterviewGrillerPage() {
  return (
    <AuthGuard
      featureName="AI SDET Interview Griller"
      description="Sign in to simulate high-stakes Lead SDET technical rounds, receive probing follow-up questions, and get your official scorecard."
    >
      <InterviewGriller />
    </AuthGuard>
  );
}
