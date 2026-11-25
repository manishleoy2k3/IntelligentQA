import ProjectFilesWorkspace from '@/components/project-files/project-files-workspace';
import AuthGuard from '@/components/auth/auth-guard';

export const metadata = {
  title: 'Project Files & Folders | IntelligentQA',
  description:
    'Upload and manage project requirements, test matrices, specs, and slide decks (.pdf, .md, .xlsx, .pptx) for zero-latency AI QA context.',
};

export default function ProjectFilesPage() {
  return (
    <AuthGuard
      featureName="Project Files & Folders Vault"
      description="Sign in to store and manage your project documentation, specs, and test matrices with zero server costs."
    >
      <ProjectFilesWorkspace />
    </AuthGuard>
  );
}
