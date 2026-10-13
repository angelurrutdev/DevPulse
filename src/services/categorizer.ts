import type { CategoryName } from '../types/news';

const AI_KEYWORDS = [
  'ai',
  'artificial intelligence',
  'inteligencia artificial',
  'machine learning',
  'deep learning',
  'neural',
  'llm',
  'gpt',
  'chatgpt',
  'claude',
  'claude code',
  'openai',
  'anthropic',
  'gemini',
  'copilot',
  'diffusion',
  'computer vision',
  'nlp',
  'transformers',
  'genai',
  'robotics',
  'robot',
  'autonomous',
  'frontier model',
  'superintelligence',
  'reasoning model',
  'ai agent',
  'deepseek',
];

const TELECOM_KEYWORDS = [
  'telecom',
  'telecommunications',
  'telecomunicaciones',
  '5g',
  '6g',
  'lte',
  'broadband',
  'cellular',
  'wireless',
  'spectrum',
  'satellite',
  'satelite',
  'starlink',
  'fiber',
  'fibra',
  'carrier',
  't-mobile',
  'verizon',
  'at&t',
  'ericsson',
  'nokia',
  'huawei',
  'qualcomm',
  'router',
  'wifi',
  'wi-fi',
  'voip',
  'esim',
  'roaming',
  'antenna',
  'telco',
  'submarine cable',
  'mobile network',
];

const SOFTWARE_DEV_KEYWORDS = [
  'software',
  'developer',
  'development',
  'desarrollo',
  'programming',
  'programacion',
  'programadores',
  'coding',
  'code',
  'javascript',
  'typescript',
  'python',
  'rust',
  'golang',
  'go lang',
  'c++',
  'react',
  'reactjs',
  'vue',
  'angular',
  'astro',
  'next.js',
  'nextjs',
  'node',
  'node.js',
  'bun',
  'backend',
  'frontend',
  'fullstack',
  'webdev',
  'database',
  'sql',
  'nosql',
  'postgres',
  'postgresql',
  'mongodb',
  'redis',
  'api',
  'apis',
  'rest api',
  'graphql',
  'git',
  'github',
  'gitlab',
  'docker',
  'kubernetes',
  'devops',
  'cloud',
  'aws',
  'azure',
  'gcp',
  'linux',
  'open source',
  'framework',
  'compiler',
  'vulnerability',
  'sdk',
  'npm',
  'css',
  'tailwind',
  'html',
  'midudev',
  'skill',
];

function scoreText(text: string, keywords: string[]): number {
  const normalized = ` ${text.toLowerCase()} `;
  let score = 0;

  for (const keyword of keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s.,!?;:()"-])${escaped}(?:$|[\\s.,!?;:()"-])`, 'i');
    if (regex.test(normalized)) {
      score += keyword.includes(' ') ? 3 : 1;
    }
  }

  return score;
}

export function detectCategory(
  title: string,
  snippet: string,
  tags: string[] = [],
  defaultFallback?: CategoryName
): CategoryName {
  if (defaultFallback) {
    return defaultFallback;
  }

  const combined = `${title} ${snippet} ${tags.join(' ')}`;

  const aiScore = scoreText(combined, AI_KEYWORDS);
  const telecomScore = scoreText(combined, TELECOM_KEYWORDS);
  const softwareScore = scoreText(combined, SOFTWARE_DEV_KEYWORDS);

  const maxScore = Math.max(aiScore, telecomScore, softwareScore);

  if (maxScore === 0) {
    return 'General Tech';
  }

  if (aiScore === maxScore) {
    return 'IA & ML';
  }

  if (softwareScore === maxScore) {
    return 'Software & Dev';
  }

  if (telecomScore === maxScore) {
    return 'Telecomunicaciones';
  }

  return 'General Tech';
}

const COMMON_TAG_PATTERNS: { regex: RegExp; tag: string }[] = [
  { regex: /\b(midudev|midu)\b/i, tag: '#midudev' },
  { regex: /\b(claudecode|claude code|claude)\b/i, tag: '#claude' },
  { regex: /\b(react|reactjs)\b/i, tag: '#react' },
  { regex: /\b(javascript|js)\b/i, tag: '#javascript' },
  { regex: /\b(typescript|ts)\b/i, tag: '#typescript' },
  { regex: /\b(next\.?js|nextjs)\b/i, tag: '#nextjs' },
  { regex: /\b(astro)\b/i, tag: '#astro' },
  { regex: /\b(python)\b/i, tag: '#python' },
  { regex: /\b(rust)\b/i, tag: '#rust' },
  { regex: /\b(open source|opensource)\b/i, tag: '#opensource' },
  { regex: /\b(ai|ia|inteligencia artificial|artificial intelligence|llm|gpt)\b/i, tag: '#ai' },
  { regex: /\b(frontend|front-end)\b/i, tag: '#frontend' },
  { regex: /\b(backend|back-end)\b/i, tag: '#backend' },
  { regex: /\b(webdev|web dev|desarrollo web)\b/i, tag: '#webdev' },
  { regex: /\b(css|tailwind)\b/i, tag: '#css' },
  { regex: /\b(github)\b/i, tag: '#github' },
  { regex: /\b(node\.?js|nodejs|bun)\b/i, tag: '#nodejs' },
  { regex: /\b(devops|docker|kubernetes)\b/i, tag: '#devops' },
  { regex: /\b(linux)\b/i, tag: '#linux' },
  { regex: /\b(telecom|5g|satelite|starlink|fibra)\b/i, tag: '#telecom' },
];

const INVALID_TAGS = new Set(['#x2f', '#39', '#34', '#amp', '#quot', '#gt', '#lt', '#nbsp', '#039', '#160']);

export function extractHashtags(
  title: string,
  snippet: string,
  rawTags: string[] = [],
  sourceId: string = '',
  category: CategoryName = 'General Tech'
): string[] {
  const cleanedText = `${title} ${snippet} ${rawTags.join(' ')}`
    .replace(/&#[a-zA-Z0-9]+;/g, ' ')
    .replace(/&[a-z]+;/g, ' ');

  const tagsSet = new Set<string>();

  // If midudev, always include #midudev
  if (sourceId === 'midudev') {
    tagsSet.add('#midudev');
  }

  // Extract explicit #hashtags from text
  const explicitMatches = cleanedText.match(/#([a-zA-Z0-9_\u00C0-\u017F]{2,24})/g);
  if (explicitMatches) {
    for (const match of explicitMatches) {
      const clean = match.toLowerCase();
      if (clean.length > 2 && clean.length < 20 && !INVALID_TAGS.has(clean) && !/^#\d+$/.test(clean)) {
        tagsSet.add(clean);
      }
    }
  }

  // Detect predefined developer tags
  for (const item of COMMON_TAG_PATTERNS) {
    if (item.regex.test(cleanedText)) {
      tagsSet.add(item.tag);
    }
  }

  // Category fallback if needed
  if (tagsSet.size < 2) {
    if (category === 'IA & ML') tagsSet.add('#ai');
    if (category === 'Software & Dev') tagsSet.add('#webdev');
    if (category === 'Telecomunicaciones') tagsSet.add('#telecom');
    if (category === 'General Tech') tagsSet.add('#technews');
  }

  return Array.from(tagsSet).slice(0, 4);
}

