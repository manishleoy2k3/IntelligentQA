import { all, createLowlight } from 'lowlight';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import css from 'highlight.js/lib/languages/css';

const lowlight = createLowlight(all);

lowlight.register('java', java);
lowlight.register('javascript', javascript);
lowlight.register('js', javascript);
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript);
lowlight.register('python', python);
lowlight.register('py', python);
lowlight.register('json', json);
lowlight.register('xml', xml);
lowlight.register('html', xml);
lowlight.register('yaml', yaml);
lowlight.register('yml', yaml);
lowlight.register('bash', bash);
lowlight.register('sh', bash);
lowlight.register('sql', sql);
lowlight.register('css', css);

export { lowlight };

export const SUPPORTED_LANGUAGES = [
  { label: 'Auto Detect', value: 'auto' },
  { label: 'Java', value: 'java' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'JSON', value: 'json' },
  { label: 'XML / HTML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'SQL', value: 'sql' },
  { label: 'CSS', value: 'css' },
];
