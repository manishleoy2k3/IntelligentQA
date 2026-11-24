import React from 'react';
import ArchitectureDiagram from './architecture-diagram';
import CodeBlock from './code-block';
import InfoCallout from './info-callout';
import WarningCallout from './warning-callout';
import ComparisonTable from './comparison-table';
import TroubleshootingSection from './troubleshooting-section';
import { LessonSectionData } from '@/data/learning/academy-curriculum';

interface LessonSectionProps {
  section: LessonSectionData;
}

export default function LessonSection({ section }: LessonSectionProps) {
  const HeadingTag = section.level === 3 ? 'h3' : 'h2';
  const headingClasses =
    section.level === 3
      ? 'text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3 scroll-mt-20'
      : 'text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 scroll-mt-20';

  return (
    <section id={section.id} className="mb-8">
      <HeadingTag className={headingClasses}>
        <a href={`#${section.id}`} className="hover:underline group flex items-center gap-2">
          <span>{section.title}</span>
          <span className="opacity-0 group-hover:opacity-100 text-emerald-600 dark:text-emerald-400 text-sm transition-opacity">
            #
          </span>
        </a>
      </HeadingTag>

      {/* Explanatory Paragraphs */}
      {section.content.map((paragraph, pIdx) => (
        <p
          key={pIdx}
          className="text-base text-slate-900 dark:text-slate-100 leading-relaxed mb-4 font-normal"
          dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      ))}

      {/* Architecture Diagram */}
      {section.diagram && <ArchitectureDiagram data={section.diagram} />}

      {/* Code Block */}
      {section.codeBlock && (
        <CodeBlock
          language={section.codeBlock.language}
          title={section.codeBlock.title}
          code={section.codeBlock.code}
          filename={section.codeBlock.filename}
          explanation={section.codeBlock.explanation}
        />
      )}

      {/* Info Callout */}
      {section.infoCallout && (
        <InfoCallout
          title={section.infoCallout.title}
          message={section.infoCallout.message}
          tip={section.infoCallout.tip}
        />
      )}

      {/* Warning Callout */}
      {section.warningCallout && (
        <WarningCallout
          title={section.warningCallout.title}
          message={section.warningCallout.message}
          tip={section.warningCallout.tip}
        />
      )}

      {/* Comparison Table */}
      {section.comparisonTable && (
        <ComparisonTable
          title={section.comparisonTable.title}
          headers={section.comparisonTable.headers}
          rows={section.comparisonTable.rows}
        />
      )}

      {/* Troubleshooting Section */}
      {section.troubleshooting && (
        <TroubleshootingSection items={section.troubleshooting} />
      )}
    </section>
  );
}
