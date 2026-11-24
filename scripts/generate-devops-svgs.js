const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '../public/uploads/curriculum-diagrams');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Git Workflow Architecture SVG
const gitWorkflowSvg = `<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 1400 700" 
  width="1400" 
  height="700" 
  style="background-color: #FAFAF9; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: block; max-width: 100%; border-radius: 16px;"
>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
    </marker>
    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#D97706" />
    </marker>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#E2E8F0" />
    </pattern>
  </defs>

  <rect x="0" y="0" width="1400" height="700" fill="#FAFAF9" rx="16"/>
  <rect x="0" y="0" width="1400" height="700" fill="url(#grid)" opacity="0.7"/>

  <!-- Title & Header -->
  <g transform="translate(60, 48)">
    <text font-size="24" font-weight="800" fill="#0F172A" letter-spacing="-0.4">
      Git 4-Stage Architecture &amp; SDET Collaboration Lifecycle
    </text>
    <text y="26" font-size="14" font-weight="500" fill="#64748B">
      The complete data flow from local automation workspace to remote repository and automated CI triggers
    </text>
  </g>

  <!-- 4 Stage Columns -->
  <!-- Stage 1: Working Directory -->
  <g transform="translate(60, 120)" filter="url(#shadow)">
    <rect width="280" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="280" height="48" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <circle cx="24" cy="24" r="8" fill="#EF4444" opacity="0.2"/>
    <circle cx="24" cy="24" r="4" fill="#EF4444"/>
    <text x="44" y="29" font-size="14" font-weight="700" fill="#0F172A">1. Working Directory</text>
    <text x="24" y="80" font-size="12" font-weight="600" fill="#64748B">LOCAL DISK FILES</text>
    <rect x="20" y="96" width="240" height="90" rx="8" fill="#F1F5F9" />
    <text x="32" y="122" font-size="11" font-family="monospace" fill="#334155">tests/login.spec.ts (modified)</text>
    <text x="32" y="146" font-size="11" font-family="monospace" fill="#334155">playwright.config.ts (untracked)</text>
    <text x="32" y="170" font-size="11" font-family="monospace" fill="#94A3B8">.gitignore (filters node_modules)</text>
    
    <rect x="20" y="200" width="240" height="150" rx="8" fill="#FEF2F2" stroke="#FCA5A5" stroke-dasharray="3 3"/>
    <text x="32" y="225" font-size="12" font-weight="700" fill="#991B1B">QA Workspace State</text>
    <text x="32" y="248" font-size="11" fill="#7F1D1D">• Test scripts, fixtures &amp; data</text>
    <text x="32" y="270" font-size="11" fill="#7F1D1D">• Uncommitted test additions</text>
    <text x="32" y="292" font-size="11" fill="#7F1D1D">• Local execution test logs</text>
    <text x="32" y="314" font-size="11" fill="#7F1D1D">• Ephemeral test artifacts</text>

    <rect x="20" y="365" width="240" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="32" y="390" font-size="12" font-weight="700" fill="#0F172A">Key Git Commands</text>
    <text x="32" y="415" font-size="11" font-family="monospace" fill="#2563EB">git status</text>
    <text x="32" y="435" font-size="11" font-family="monospace" fill="#2563EB">git diff</text>
    <text x="32" y="455" font-size="11" font-family="monospace" fill="#2563EB">git restore &lt;file&gt;</text>
  </g>

  <!-- Transition 1 -> 2: git add -->
  <g transform="translate(345, 230)">
    <line x1="0" y1="0" x2="40" y2="0" stroke="#059669" stroke-width="2.5" marker-end="url(#arrow)" />
    <text x="20" y="-10" text-anchor="middle" font-size="11" font-family="monospace" font-weight="700" fill="#059669">git add</text>
  </g>

  <!-- Stage 2: Staging Area (Index) -->
  <g transform="translate(390, 120)" filter="url(#shadow)">
    <rect width="280" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="280" height="48" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <circle cx="24" cy="24" r="8" fill="#F59E0B" opacity="0.2"/>
    <circle cx="24" cy="24" r="4" fill="#F59E0B"/>
    <text x="44" y="29" font-size="14" font-weight="700" fill="#0F172A">2. Staging Area (Index)</text>
    <text x="24" y="80" font-size="12" font-weight="600" fill="#64748B">PREPARED CHANGES</text>
    <rect x="20" y="96" width="240" height="90" rx="8" fill="#FFFBEB" stroke="#FDE68A" />
    <text x="32" y="125" font-size="11" font-weight="700" fill="#92400E">Binary Tree Index</text>
    <text x="32" y="148" font-size="11" fill="#78350F">Blob references computed</text>
    <text x="32" y="170" font-size="11" fill="#78350F">SHA-1 checksums indexed</text>

    <rect x="20" y="200" width="240" height="150" rx="8" fill="#F0FDF4" stroke="#86EFAC"/>
    <text x="32" y="225" font-size="12" font-weight="700" fill="#166534">Pre-Commit Inspection</text>
    <text x="32" y="248" font-size="11" fill="#14532D">• Staged test case updates</text>
    <text x="32" y="270" font-size="11" fill="#14532D">• Pre-commit linter verification</text>
    <text x="32" y="292" font-size="11" fill="#14532D">• Husky hook validation</text>
    <text x="32" y="314" font-size="11" fill="#14532D">• Ready for atomic commit</text>

    <rect x="20" y="365" width="240" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="32" y="390" font-size="12" font-weight="700" fill="#0F172A">Key Git Commands</text>
    <text x="32" y="415" font-size="11" font-family="monospace" fill="#059669">git status</text>
    <text x="32" y="435" font-size="11" font-family="monospace" fill="#059669">git diff --cached</text>
    <text x="32" y="455" font-size="11" font-family="monospace" fill="#059669">git restore --staged &lt;f&gt;</text>
  </g>

  <!-- Transition 2 -> 3: git commit -->
  <g transform="translate(675, 230)">
    <line x1="0" y1="0" x2="40" y2="0" stroke="#059669" stroke-width="2.5" marker-end="url(#arrow)" />
    <text x="20" y="-10" text-anchor="middle" font-size="11" font-family="monospace" font-weight="700" fill="#059669">git commit</text>
  </g>

  <!-- Stage 3: Local Repository (.git) -->
  <g transform="translate(720, 120)" filter="url(#shadow)">
    <rect width="280" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="280" height="48" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <circle cx="24" cy="24" r="8" fill="#10B981" opacity="0.2"/>
    <circle cx="24" cy="24" r="4" fill="#10B981"/>
    <text x="44" y="29" font-size="14" font-weight="700" fill="#0F172A">3. Local Repository (.git)</text>
    <text x="24" y="80" font-size="12" font-weight="600" fill="#64748B">LOCAL COMMIT HISTORY</text>
    <rect x="20" y="96" width="240" height="90" rx="8" fill="#ECFDF5" stroke="#A7F3D0" />
    <text x="32" y="125" font-size="11" font-weight="700" fill="#065F46">DAG of Commits</text>
    <text x="32" y="148" font-size="11" fill="#047857">HEAD -> feat/checkout-tests</text>
    <text x="32" y="170" font-size="11" fill="#047857">Local snapshot graph frozen</text>

    <rect x="20" y="200" width="240" height="150" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
    <text x="32" y="225" font-size="12" font-weight="700" fill="#1E40AF">Branch Management</text>
    <text x="32" y="248" font-size="11" fill="#1E3A8A">• Fast branch switching (0 cost)</text>
    <text x="32" y="270" font-size="11" fill="#1E3A8A">• Interactive rebase (reword/squash)</text>
    <text x="32" y="292" font-size="11" fill="#1E3A8A">• Stash temporary WIP scripts</text>
    <text x="32" y="314" font-size="11" fill="#1E3A8A">• Offline full history access</text>

    <rect x="20" y="365" width="240" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="32" y="390" font-size="12" font-weight="700" fill="#0F172A">Key Git Commands</text>
    <text x="32" y="415" font-size="11" font-family="monospace" fill="#059669">git commit -m &quot;feat: ...&quot;</text>
    <text x="32" y="435" font-size="11" font-family="monospace" fill="#059669">git rebase -i HEAD~3</text>
    <text x="32" y="455" font-size="11" font-family="monospace" fill="#059669">git log --oneline --graph</text>
  </g>

  <!-- Transition 3 -> 4: git push -->
  <g transform="translate(1005, 230)">
    <line x1="0" y1="0" x2="40" y2="0" stroke="#2563EB" stroke-width="2.5" marker-end="url(#arrow-blue)" />
    <text x="20" y="-10" text-anchor="middle" font-size="11" font-family="monospace" font-weight="700" fill="#2563EB">git push</text>
  </g>
  <!-- Transition 4 -> 3: git pull / fetch -->
  <g transform="translate(1005, 300)">
    <line x1="40" y1="0" x2="0" y2="0" stroke="#D97706" stroke-width="2.5" marker-end="url(#arrow-amber)" />
    <text x="20" y="-10" text-anchor="middle" font-size="11" font-family="monospace" font-weight="700" fill="#D97706">git pull</text>
  </g>

  <!-- Stage 4: Remote Repository (GitHub / Azure Repos / GitLab) -->
  <g transform="translate(1050, 120)" filter="url(#shadow)">
    <rect width="290" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="290" height="48" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <circle cx="24" cy="24" r="8" fill="#3B82F6" opacity="0.2"/>
    <circle cx="24" cy="24" r="4" fill="#3B82F6"/>
    <text x="44" y="29" font-size="14" font-weight="700" fill="#0F172A">4. Remote (GitHub / GitLab / ADO)</text>
    <text x="24" y="80" font-size="12" font-weight="600" fill="#64748B">ENTERPRISE CI/CD GATES</text>
    <rect x="20" y="96" width="250" height="90" rx="8" fill="#EFF6FF" stroke="#93C5FD" />
    <text x="32" y="125" font-size="11" font-weight="700" fill="#1E40AF">Branch Protection Rules</text>
    <text x="32" y="148" font-size="11" fill="#1E3A8A">• Require PR reviews (2 approvals)</text>
    <text x="32" y="170" font-size="11" fill="#1E3A8A">• Require passing CI test gates</text>

    <rect x="20" y="200" width="250" height="150" rx="8" fill="#FAF5FF" stroke="#D8B4FE"/>
    <text x="32" y="225" font-size="12" font-weight="700" fill="#6B21A8">Automated CI Triggers</text>
    <text x="32" y="248" font-size="11" fill="#581C87">• Webhooks: push / pull_request</text>
    <text x="32" y="270" font-size="11" fill="#581C87">• GitHub Actions matrix shards</text>
    <text x="32" y="292" font-size="11" fill="#581C87">• Jenkins multibranch webhooks</text>
    <text x="32" y="314" font-size="11" fill="#581C87">• Azure Pipelines quality gates</text>

    <rect x="20" y="365" width="250" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="32" y="390" font-size="12" font-weight="700" fill="#0F172A">Key Git Commands</text>
    <text x="32" y="415" font-size="11" font-family="monospace" fill="#2563EB">git push origin feat/branch</text>
    <text x="32" y="435" font-size="11" font-family="monospace" fill="#2563EB">git fetch --all --prune</text>
    <text x="32" y="455" font-size="11" font-family="monospace" fill="#2563EB">gh pr create --fill</text>
  </g>
</svg>`;

// 2. Azure DevOps Pipeline Architecture SVG
const azureDevOpsSvg = `<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 1400 700" 
  width="1400" 
  height="700" 
  style="background-color: #FAFAF9; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: block; max-width: 100%; border-radius: 16px;"
>
  <defs>
    <marker id="ado-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0078D4" />
    </marker>
    <filter id="ado-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
    <pattern id="ado-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#E2E8F0" />
    </pattern>
  </defs>

  <rect x="0" y="0" width="1400" height="700" fill="#FAFAF9" rx="16"/>
  <rect x="0" y="0" width="1400" height="700" fill="url(#ado-grid)" opacity="0.7"/>

  <!-- Title & Header -->
  <g transform="translate(60, 48)">
    <text font-size="24" font-weight="800" fill="#0F172A" letter-spacing="-0.4">
      Azure DevOps Multi-Stage YAML Testing Pipeline &amp; Quality Release Gates
    </text>
    <text y="26" font-size="14" font-weight="500" fill="#64748B">
      Architecture: Code Trigger → Agent Pools → Test Execution → PublishTestResults@2 → Azure Test Plans &amp; Release Gates
    </text>
  </g>

  <!-- Stage 1: Trigger & Source Repos -->
  <g transform="translate(60, 120)" filter="url(#ado-shadow)">
    <rect width="260" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="260" height="48" rx="14" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#0369A1">1. Pipeline Triggers</text>
    
    <rect x="20" y="70" width="220" height="110" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="32" y="95" font-size="12" font-weight="700" fill="#0F172A">Trigger Types</text>
    <text x="32" y="120" font-size="11" fill="#475569">• PR Validation (PR to main)</text>
    <text x="32" y="142" font-size="11" fill="#475569">• Scheduled Cron (Nightly suite)</text>
    <text x="32" y="164" font-size="11" fill="#475569">• Release Tag / CD Event</text>

    <rect x="20" y="200" width="220" height="260" rx="8" fill="#0F172A"/>
    <text x="32" y="225" font-size="11" font-family="monospace" fill="#38BDF8"># azure-pipelines.yml</text>
    <text x="32" y="248" font-size="10" font-family="monospace" fill="#F8FAFC">trigger:</text>
    <text x="44" y="268" font-size="10" font-family="monospace" fill="#F8FAFC">branches:</text>
    <text x="56" y="288" font-size="10" font-family="monospace" fill="#81FF89">include: [ main, release/* ]</text>
    <text x="32" y="312" font-size="10" font-family="monospace" fill="#F8FAFC">pr:</text>
    <text x="44" y="332" font-size="10" font-family="monospace" fill="#81FF89">branches: [ main ]</text>
    <text x="32" y="356" font-size="10" font-family="monospace" fill="#F8FAFC">stages:</text>
    <text x="44" y="376" font-size="10" font-family="monospace" fill="#CBD5E1">- stage: Build</text>
    <text x="44" y="396" font-size="10" font-family="monospace" fill="#CBD5E1">- stage: SmokeTest</text>
    <text x="44" y="416" font-size="10" font-family="monospace" fill="#CBD5E1">- stage: FullRegression</text>
    <text x="44" y="436" font-size="10" font-family="monospace" fill="#CBD5E1">- stage: DeployToStaging</text>
  </g>

  <!-- Arrow 1 -> 2 -->
  <line x1="320" y1="280" x2="360" y2="280" stroke="#0078D4" stroke-width="2.5" marker-end="url(#ado-arrow)" />

  <!-- Stage 2: Agent Pools Execution -->
  <g transform="translate(365, 120)" filter="url(#ado-shadow)">
    <rect width="300" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="300" height="48" rx="14" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#1E40AF">2. Agent Pools &amp; Jobs</text>

    <!-- Microsoft-hosted vs Self-hosted -->
    <rect x="20" y="70" width="260" height="130" rx="8" fill="#F0FDF4" stroke="#86EFAC"/>
    <text x="32" y="95" font-size="12" font-weight="700" fill="#166534">Microsoft-Hosted Agents</text>
    <text x="32" y="118" font-size="11" fill="#14532D">• vmImage: 'ubuntu-latest'</text>
    <text x="32" y="138" font-size="11" fill="#14532D">• Fresh ephemeral container every job</text>
    <text x="32" y="158" font-size="11" fill="#14532D">• Pre-installed Node, Java, Docker, Python</text>
    <text x="32" y="178" font-size="11" fill="#14532D">• Zero maintenance overhead</text>

    <rect x="20" y="215" width="260" height="130" rx="8" fill="#FEFCE8" stroke="#FDE047"/>
    <text x="32" y="240" font-size="12" font-weight="700" fill="#854D0E">Self-Hosted Agent Pools</text>
    <text x="32" y="263" font-size="11" fill="#713F12">• pool: name: 'SDET-Dedicated-Pool'</text>
    <text x="32" y="283" font-size="11" fill="#713F12">• Internal VPC &amp; private microservices</text>
    <text x="32" y="303" font-size="11" fill="#713F12">• Pre-cached browser binaries (Playwright/Chrome)</text>
    <text x="32" y="323" font-size="11" fill="#713F12">• High concurrency (16+ parallel jobs)</text>

    <rect x="20" y="360" width="260" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
    <text x="32" y="385" font-size="12" font-weight="700" fill="#0F172A">Test Runners Executed</text>
    <text x="32" y="408" font-size="11" font-family="monospace" fill="#2563EB">npx playwright test</text>
    <text x="32" y="428" font-size="11" font-family="monospace" fill="#2563EB">mvn test (Rest Assured / Selenium)</text>
    <text x="32" y="448" font-size="11" font-family="monospace" fill="#2563EB">newman run api-collection.json</text>
  </g>

  <!-- Arrow 2 -> 3 -->
  <line x1="665" y1="280" x2="705" y2="280" stroke="#0078D4" stroke-width="2.5" marker-end="url(#ado-arrow)" />

  <!-- Stage 3: PublishTestResults@2 & Artifacts -->
  <g transform="translate(710, 120)" filter="url(#ado-shadow)">
    <rect width="320" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="320" height="48" rx="14" fill="#FAF5FF" stroke="#E9D5FF" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#6B21A8">3. PublishTestResults@2</text>

    <rect x="20" y="70" width="280" height="180" rx="8" fill="#0F172A"/>
    <text x="32" y="95" font-size="11" font-family="monospace" fill="#38BDF8">- task: PublishTestResults@2</text>
    <text x="32" y="118" font-size="10" font-family="monospace" fill="#E2E8F0">  inputs:</text>
    <text x="44" y="138" font-size="10" font-family="monospace" fill="#81FF89">    testResultsFormat: 'JUnit'</text>
    <text x="44" y="158" font-size="10" font-family="monospace" fill="#81FF89">    testResultsFiles: '**/results/*.xml'</text>
    <text x="44" y="178" font-size="10" font-family="monospace" fill="#81FF89">    searchFolder: '$(System.DefaultWorkingDir)'</text>
    <text x="44" y="198" font-size="10" font-family="monospace" fill="#81FF89">    mergeTestResults: true</text>
    <text x="44" y="218" font-size="10" font-family="monospace" fill="#81FF89">    failTaskOnFailedTests: true</text>
    <text x="44" y="238" font-size="10" font-family="monospace" fill="#81FF89">    testRunTitle: 'E2E Regression Run'</text>

    <rect x="20" y="265" width="280" height="210" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="32" y="290" font-size="12" font-weight="700" fill="#0F172A">Azure DevOps Analytics Dashboard</text>
    <text x="32" y="315" font-size="11" fill="#334155">• Pass/Fail % breakdown &amp; duration trends</text>
    <text x="32" y="337" font-size="11" fill="#334155">• Automatic Flaky Test Tagging &amp; metrics</text>
    <text x="32" y="359" font-size="11" fill="#334155">• Stack trace &amp; screenshot attachments</text>
    <text x="32" y="381" font-size="11" fill="#334155">• Pipeline failure root cause insights</text>
    <text x="32" y="403" font-size="11" fill="#334155">• Export to PowerBI quality reports</text>
    <text x="32" y="435" font-size="11" font-weight="700" fill="#059669">✓ Condition: always() ensures upload on fail</text>
  </g>

  <!-- Arrow 3 -> 4 -->
  <line x1="1030" y1="280" x2="1065" y2="280" stroke="#0078D4" stroke-width="2.5" marker-end="url(#ado-arrow)" />

  <!-- Stage 4: Test Plans & Release Gates -->
  <g transform="translate(1070, 120)" filter="url(#ado-shadow)">
    <rect width="270" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="270" height="48" rx="14" fill="#FEF2F2" stroke="#FECACA" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#991B1B">4. Test Plans &amp; Gates</text>

    <rect x="20" y="70" width="230" height="150" rx="8" fill="#FFF1F2" stroke="#FDA4AF"/>
    <text x="32" y="95" font-size="12" font-weight="700" fill="#9F1239">Azure Test Plans Traceability</text>
    <text x="32" y="120" font-size="11" fill="#881337">• Link automated test method</text>
    <text x="32" y="142" font-size="11" fill="#881337">  to Manual TestCase ID</text>
    <text x="32" y="164" font-size="11" fill="#881337">• Bidirectional traceability matrix</text>
    <text x="32" y="186" font-size="11" fill="#881337">• Requirements coverage report</text>
    <text x="32" y="208" font-size="11" fill="#881337">• Compliance &amp; audit evidence</text>

    <rect x="20" y="235" width="230" height="235" rx="8" fill="#F0FDF4" stroke="#86EFAC"/>
    <text x="32" y="260" font-size="12" font-weight="700" fill="#166534">Pre-Deployment Gates</text>
    <text x="32" y="285" font-size="11" fill="#14532D">• Pass rate gate: ≥ 98%</text>
    <text x="32" y="307" font-size="11" fill="#14532D">• Zero critical / blocker defects</text>
    <text x="32" y="329" font-size="11" fill="#14532D">• Azure Monitor Alert checking</text>
    <text x="32" y="351" font-size="11" fill="#14532D">• Security scan gate (SonarQube)</text>
    <text x="32" y="373" font-size="11" fill="#14532D">• Automated rollback if health</text>
    <text x="32" y="393" font-size="11" fill="#14532D">  probes fail post-deploy</text>
    <rect x="30" y="415" width="210" height="35" rx="6" fill="#15803D" />
    <text x="135" y="437" text-anchor="middle" font-size="11" font-weight="700" fill="#FFFFFF">GATE PASSED: DEPLOY OK</text>
  </g>
</svg>`;

// 3. Jenkins Declarative Pipeline Architecture SVG
const jenkinsPipelineSvg = `<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 1400 700" 
  width="1400" 
  height="700" 
  style="background-color: #FAFAF9; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: block; max-width: 100%; border-radius: 16px;"
>
  <defs>
    <marker id="jen-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#D97706" />
    </marker>
    <filter id="jen-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
    <pattern id="jen-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#E2E8F0" />
    </pattern>
  </defs>

  <rect x="0" y="0" width="1400" height="700" fill="#FAFAF9" rx="16"/>
  <rect x="0" y="0" width="1400" height="700" fill="url(#jen-grid)" opacity="0.7"/>

  <!-- Title & Header -->
  <g transform="translate(60, 48)">
    <text font-size="24" font-weight="800" fill="#0F172A" letter-spacing="-0.4">
      Declarative Jenkins Distributed Test Architecture &amp; Notifications
    </text>
    <text y="26" font-size="14" font-weight="500" fill="#64748B">
      Master-Agent Architecture: Multibranch Webhook → Docker Agent Containers → Parallel Stages → HTML Reports &amp; Slack
    </text>
  </g>

  <!-- Stage 1: Controller & Multibranch -->
  <g transform="translate(60, 120)" filter="url(#jen-shadow)">
    <rect width="270" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="270" height="48" rx="14" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#B45309">1. Jenkins Controller</text>

    <rect x="20" y="70" width="230" height="120" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="32" y="95" font-size="12" font-weight="700" fill="#0F172A">Multibranch Pipeline</text>
    <text x="32" y="120" font-size="11" fill="#475569">• GitHub / Bitbucket Webhook</text>
    <text x="32" y="142" font-size="11" fill="#475569">• Auto branch discovery</text>
    <text x="32" y="164" font-size="11" fill="#475569">• Scan PRs &amp; tag builds</text>

    <rect x="20" y="205" width="230" height="260" rx="8" fill="#0F172A"/>
    <text x="32" y="230" font-size="11" font-family="monospace" fill="#FBBF24">// Jenkinsfile</text>
    <text x="32" y="250" font-size="10" font-family="monospace" fill="#F8FAFC">pipeline {</text>
    <text x="44" y="270" font-size="10" font-family="monospace" fill="#F8FAFC">  agent none</text>
    <text x="44" y="290" font-size="10" font-family="monospace" fill="#F8FAFC">  options {</text>
    <text x="56" y="310" font-size="10" font-family="monospace" fill="#81FF89">    timeout(time: 1, unit: 'HOURS')</text>
    <text x="56" y="330" font-size="10" font-family="monospace" fill="#81FF89">    retry(1)</text>
    <text x="44" y="350" font-size="10" font-family="monospace" fill="#F8FAFC">  }</text>
    <text x="44" y="370" font-size="10" font-family="monospace" fill="#F8FAFC">  stages {</text>
    <text x="56" y="390" font-size="10" font-family="monospace" fill="#38BDF8">    stage('Build &amp; Lint')</text>
    <text x="56" y="410" font-size="10" font-family="monospace" fill="#38BDF8">    stage('Parallel E2E')</text>
    <text x="56" y="430" font-size="10" font-family="monospace" fill="#38BDF8">    stage('Quality Gate')</text>
    <text x="44" y="450" font-size="10" font-family="monospace" fill="#F8FAFC">  }</text>
  </g>

  <!-- Arrow 1 -> 2 -->
  <line x1="330" y1="280" x2="370" y2="280" stroke="#D97706" stroke-width="2.5" marker-end="url(#jen-arrow)" />

  <!-- Stage 2: Docker Agents & Parallel Stages -->
  <g transform="translate(375, 120)" filter="url(#jen-shadow)">
    <rect width="360" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="360" height="48" rx="14" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#1D4ED8">2. Docker Agents &amp; Parallel Execution</text>

    <!-- Shard 1 -->
    <rect x="20" y="70" width="320" height="110" rx="8" fill="#F0FDF4" stroke="#86EFAC"/>
    <text x="32" y="95" font-size="12" font-weight="700" fill="#166534">Stage: Playwright UI Tests (Chromium/Firefox)</text>
    <text x="32" y="118" font-size="11" font-family="monospace" fill="#14532D">agent { docker { image 'mcr.microsoft.com/playwright:v1.49.0' } }</text>
    <text x="32" y="140" font-size="11" fill="#14532D">sh 'npx playwright test --shard=1/2'</text>
    <text x="32" y="160" font-size="11" font-weight="600" fill="#15803D">✓ Isolated headless browser container</text>

    <!-- Shard 2 -->
    <rect x="20" y="195" width="320" height="110" rx="8" fill="#EFF6FF" stroke="#93C5FD"/>
    <text x="32" y="220" font-size="12" font-weight="700" fill="#1E40AF">Stage: Rest Assured API Microservice Tests</text>
    <text x="32" y="243" font-size="11" font-family="monospace" fill="#1E3A8A">agent { docker { image 'maven:3.9-eclipse-temurin-21' } }</text>
    <text x="32" y="265" font-size="11" fill="#1E3A8A">sh 'mvn clean test -Dsuite=api-regression.xml'</text>
    <text x="32" y="285" font-size="11" font-weight="600" fill="#2563EB">✓ Fast parallel execution (zero UI overhead)</text>

    <!-- Shard 3 -->
    <rect x="20" y="320" width="320" height="110" rx="8" fill="#FAF5FF" stroke="#D8B4FE"/>
    <text x="32" y="345" font-size="12" font-weight="700" fill="#6B21A8">Stage: Mobile Appium / Cross-Browser Smoke</text>
    <text x="32" y="368" font-size="11" font-family="monospace" fill="#581C87">agent { label 'appium-mac-runner' }</text>
    <text x="32" y="390" font-size="11" fill="#581C87">sh './run-appium-ios-simulator.sh'</text>
    <text x="32" y="410" font-size="11" font-weight="600" fill="#7E22CE">✓ Bare-metal iOS/Android device farm</text>

    <text x="32" y="455" font-size="11" font-weight="700" fill="#0F172A">Total Wall-Clock Time Reduced by 75% with parallel { ... }</text>
  </g>

  <!-- Arrow 2 -> 3 -->
  <line x1="735" y1="280" x2="775" y2="280" stroke="#D97706" stroke-width="2.5" marker-end="url(#jen-arrow)" />

  <!-- Stage 3: Test Reporting & Post Actions -->
  <g transform="translate(780, 120)" filter="url(#jen-shadow)">
    <rect width="280" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="280" height="48" rx="14" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#166534">3. Post Actions &amp; Reporting</text>

    <rect x="20" y="70" width="240" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="32" y="95" font-size="12" font-weight="700" fill="#0F172A">JUnit XML Publishing</text>
    <text x="32" y="118" font-size="11" font-family="monospace" fill="#2563EB">junit '**/surefire-reports/*.xml'</text>
    <text x="32" y="140" font-size="11" fill="#475569">• Jenkins test trend graph</text>
    <text x="32" y="162" font-size="11" fill="#475569">• Failed test age &amp; regression delta</text>
    <text x="32" y="184" font-size="11" fill="#475569">• Automatic build health score (weather)</text>

    <rect x="20" y="235" width="240" height="150" rx="8" fill="#F5F3FF" stroke="#DDD6FE"/>
    <text x="32" y="260" font-size="12" font-weight="700" fill="#5B21B6">publishHTML &amp; Allure</text>
    <text x="32" y="283" font-size="11" font-family="monospace" fill="#7C3AED">publishHTML(target: [ ... ])</text>
    <text x="32" y="305" font-size="11" fill="#6D28D9">• Playwright HTML report archive</text>
    <text x="32" y="327" font-size="11" fill="#6D28D9">• Video recordings &amp; trace viewer</text>
    <text x="32" y="349" font-size="11" fill="#6D28D9">• Allure history trends &amp; categories</text>
    <text x="32" y="371" font-size="11" fill="#6D28D9">• Interactive drill-down per test</text>

    <rect x="20" y="400" width="240" height="70" rx="8" fill="#FEF2F2" stroke="#FCA5A5"/>
    <text x="32" y="425" font-size="11" font-weight="700" fill="#991B1B">post { always { ... } }</text>
    <text x="32" y="448" font-size="11" fill="#7F1D1D">Ensures test report archive on failure!</text>
  </g>

  <!-- Arrow 3 -> 4 -->
  <line x1="1060" y1="280" x2="1100" y2="280" stroke="#D97706" stroke-width="2.5" marker-end="url(#jen-arrow)" />

  <!-- Stage 4: Slack Notifications & Alerts -->
  <g transform="translate(1105, 120)" filter="url(#jen-shadow)">
    <rect width="245" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="245" height="48" rx="14" fill="#FAF5FF" stroke="#F3E8FF" stroke-width="1.5" />
    <text x="24" y="29" font-size="14" font-weight="700" fill="#6B21A8">4. Slack &amp; Teams Alerts</text>

    <rect x="15" y="70" width="215" height="200" rx="8" fill="#0F172A"/>
    <text x="25" y="95" font-size="11" font-family="monospace" fill="#F472B6">post {</text>
    <text x="32" y="118" font-size="10" font-family="monospace" fill="#F87171">  failure {</text>
    <text x="40" y="138" font-size="10" font-family="monospace" fill="#F8FAFC">    slackSend(</text>
    <text x="48" y="158" font-size="10" font-family="monospace" fill="#F8FAFC">      color: '#FF0000',</text>
    <text x="48" y="178" font-size="10" font-family="monospace" fill="#81FF89">      channel: '#qa-alerts',</text>
    <text x="48" y="198" font-size="10" font-family="monospace" fill="#CBD5E1">      message: &quot;❌ Build</text>
    <text x="48" y="218" font-size="10" font-family="monospace" fill="#CBD5E1">      FAILED: \${env.JOB_NAME}&quot;</text>
    <text x="40" y="238" font-size="10" font-family="monospace" fill="#F8FAFC">    )</text>
    <text x="32" y="258" font-size="10" font-family="monospace" fill="#F87171">  }</text>
    <text x="25" y="278" font-size="11" font-family="monospace" fill="#F472B6">}</text>

    <rect x="15" y="285" width="215" height="185" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="25" y="310" font-size="12" font-weight="700" fill="#0F172A">Enterprise Alert Routing</text>
    <text x="25" y="335" font-size="11" fill="#334155">• Direct @mention to author</text>
    <text x="25" y="357" font-size="11" fill="#334155">• Deep link to Playwright trace</text>
    <text x="25" y="379" font-size="11" fill="#334155">• Top 3 failed spec titles</text>
    <text x="25" y="401" font-size="11" fill="#334155">• Auto-quarantine flaky tests</text>
    <text x="25" y="423" font-size="11" fill="#334155">• PagerDuty for release block</text>
    <text x="25" y="452" font-size="11" font-weight="700" fill="#059669">✓ Real-time SDET triage</text>
  </g>
</svg>`;

// 4. Git Branching Strategies SVG (Trunk vs GitFlow)
const gitBranchingSvg = `<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 1400 700" 
  width="1400" 
  height="700" 
  style="background-color: #FAFAF9; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: block; max-width: 100%; border-radius: 16px;"
>
  <defs>
    <marker id="branch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4F46E5" />
    </marker>
    <filter id="br-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
    <pattern id="br-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#E2E8F0" />
    </pattern>
  </defs>

  <rect x="0" y="0" width="1400" height="700" fill="#FAFAF9" rx="16"/>
  <rect x="0" y="0" width="1400" height="700" fill="url(#br-grid)" opacity="0.7"/>

  <!-- Title & Header -->
  <g transform="translate(60, 48)">
    <text font-size="24" font-weight="800" fill="#0F172A" letter-spacing="-0.4">
      Git Branching Models for Test Automation: Trunk-Based vs GitFlow
    </text>
    <text y="26" font-size="14" font-weight="500" fill="#64748B">
      Evaluating velocity, merge conflict risks, and automated CI quality gate enforcement
    </text>
  </g>

  <!-- Left: Trunk-Based Development -->
  <g transform="translate(60, 120)" filter="url(#br-shadow)">
    <rect width="600" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="600" height="48" rx="14" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5" />
    <text x="24" y="29" font-size="15" font-weight="700" fill="#065F46">Model A: Trunk-Based Development (Recommended for Modern QA)</text>

    <!-- Visual Trunk Diagram -->
    <g transform="translate(40, 70)">
      <!-- Main trunk line -->
      <line x1="20" y1="60" x2="500" y2="60" stroke="#059669" stroke-width="6" stroke-linecap="round"/>
      <text x="510" y="65" font-size="13" font-weight="700" fill="#059669">main</text>

      <!-- Commits on main -->
      <circle cx="60" cy="60" r="12" fill="#059669" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="180" cy="60" r="12" fill="#059669" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="300" cy="60" r="12" fill="#059669" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="440" cy="60" r="12" fill="#059669" stroke="#FFFFFF" stroke-width="3"/>

      <!-- Short-lived branch 1 -->
      <path d="M 60 60 C 90 120, 150 120, 180 60" fill="none" stroke="#2563EB" stroke-width="3" stroke-dasharray="4 4"/>
      <circle cx="120" cy="105" r="9" fill="#2563EB" stroke="#FFFFFF" stroke-width="2"/>
      <text x="120" y="130" text-anchor="middle" font-size="10" font-weight="600" fill="#1E40AF">feat/add-cart-tests (&lt; 24h)</text>

      <!-- Short-lived branch 2 -->
      <path d="M 180 60 C 210 120, 270 120, 300 60" fill="none" stroke="#7C3AED" stroke-width="3" stroke-dasharray="4 4"/>
      <circle cx="240" cy="105" r="9" fill="#7C3AED" stroke="#FFFFFF" stroke-width="2"/>
      <text x="240" y="130" text-anchor="middle" font-size="10" font-weight="600" fill="#5B21B6">fix/flaky-auth-wait (&lt; 12h)</text>
    </g>

    <rect x="30" y="240" width="540" height="220" rx="8" fill="#F0FDF4" stroke="#86EFAC"/>
    <text x="45" y="265" font-size="13" font-weight="700" fill="#166534">Trunk-Based QA Advantages</text>
    <text x="45" y="295" font-size="12" fill="#14532D">1. Zero Long-Lived Merge Conflicts: Branch lifetime is under 24 hours.</text>
    <text x="45" y="325" font-size="12" fill="#14532D">2. Continuous Feedback: Every PR triggers full test suites before merge.</text>
    <text x="45" y="355" font-size="12" fill="#14532D">3. Feature Flags in Tests: Test features in dark mode prior to user release.</text>
    <text x="45" y="385" font-size="12" fill="#14532D">4. High Release Cadence: Multiple daily production deployments safely.</text>
    <text x="45" y="415" font-size="12" font-weight="700" fill="#047857">✓ Best for: Agile, Cloud-Native, Continuous Delivery teams.</text>
  </g>

  <!-- Right: GitFlow Model -->
  <g transform="translate(740, 120)" filter="url(#br-shadow)">
    <rect width="600" height="500" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <rect width="600" height="48" rx="14" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5" />
    <text x="24" y="29" font-size="15" font-weight="700" fill="#1E40AF">Model B: Traditional GitFlow (Legacy Enterprise)</text>

    <!-- Visual GitFlow Diagram -->
    <g transform="translate(40, 70)">
      <!-- main line -->
      <line x1="20" y1="30" x2="500" y2="30" stroke="#0F172A" stroke-width="4"/>
      <text x="510" y="35" font-size="12" font-weight="700" fill="#0F172A">main</text>
      <!-- develop line -->
      <line x1="20" y1="80" x2="500" y2="80" stroke="#2563EB" stroke-width="4"/>
      <text x="510" y="85" font-size="12" font-weight="700" fill="#2563EB">develop</text>
      <!-- release branch -->
      <line x1="260" y1="130" x2="420" y2="130" stroke="#D97706" stroke-width="3" stroke-dasharray="3 3"/>
      <text x="430" y="135" font-size="11" font-weight="700" fill="#D97706">release/v2.1</text>
      <!-- feature branch -->
      <line x1="80" y1="170" x2="220" y2="170" stroke="#7C3AED" stroke-width="3" stroke-dasharray="3 3"/>
      <text x="230" y="175" font-size="11" font-weight="700" fill="#7C3AED">feature/...</text>

      <circle cx="80" cy="30" r="7" fill="#0F172A"/>
      <circle cx="440" cy="30" r="7" fill="#0F172A"/>
      <circle cx="60" cy="80" r="7" fill="#2563EB"/>
      <circle cx="240" cy="80" r="7" fill="#2563EB"/>
      <circle cx="480" cy="80" r="7" fill="#2563EB"/>
    </g>

    <rect x="30" y="240" width="540" height="220" rx="8" fill="#FFFBEB" stroke="#FDE68A"/>
    <text x="45" y="265" font-size="13" font-weight="700" fill="#92400E">GitFlow Considerations for QA</text>
    <text x="45" y="295" font-size="12" fill="#78350F">1. Complex Multi-Branch Sync: Tests must be verified across develop &amp; main.</text>
    <text x="45" y="325" font-size="12" fill="#78350F">2. Merge Hell at Release Cut: Regressions discovered late during release branch.</text>
    <text x="45" y="355" font-size="12" fill="#78350F">3. Heavy Stale Test Divergence: Feature branches living weeks drift from HEAD.</text>
    <text x="45" y="385" font-size="12" fill="#78350F">4. Strict Auditability: Beneficial for quarterly scheduled medical/banking releases.</text>
    <text x="45" y="415" font-size="12" font-weight="700" fill="#B45309">⚠️ Warning: Higher maintenance overhead for automated test suites.</text>
  </g>
</svg>`;

// Write the SVGs
fs.writeFileSync(path.join(outputDir, 'git-workflow-architecture.svg'), gitWorkflowSvg, 'utf8');
fs.writeFileSync(path.join(outputDir, 'azure-devops-pipeline-architecture.svg'), azureDevOpsSvg, 'utf8');
fs.writeFileSync(path.join(outputDir, 'jenkins-pipeline-architecture.svg'), jenkinsPipelineSvg, 'utf8');
fs.writeFileSync(path.join(outputDir, 'git-branching-architecture.svg'), gitBranchingSvg, 'utf8');

console.log('✅ Generated 4 High-Fidelity SVG Architecture Infographics in:', outputDir);
