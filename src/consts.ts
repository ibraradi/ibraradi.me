// Central content for the site. Edit values here to update the whole site.

// Feature flag: set to `true` to bring the blog back (nav link, home CTA,
// /blog pages, RSS feed, and sitemap entries all switch on together).
export const BLOG_ENABLED = true;

export const SITE = {
  name: 'Ibrahim Radi',
  title: 'Ibrahim Radi · Security Engineer',
  tagline: 'Security Engineer & Co-Founder',
  description:
    'Ibrahim Radi, Security Engineer and technical co-founder of Flawtrack. ' +
    'Attack Surface Management, threat intelligence, DevSecOps, penetration testing, and CTF.',
  url: 'https://ibraradi.me',
  location: 'Kuala Lumpur, Malaysia',
} as const;

export const SOCIALS = {
  email: 'me@ibraradi.me',
  github: 'https://github.com/ibraradi',
  linkedin: 'https://www.linkedin.com/in/ibraradi/',
  x: 'https://x.com/ibraradi9',
  xHandle: '@ibraradi9',
} as const;

export const NAV = [
  { label: 'About', href: '/#about' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Awards', href: '/#awards' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
] as const;

// Hero highlight stats pulled from real impact numbers.
export const STATS = [
  { value: '2B+', label: 'stealer leaks processed' },
  { value: '7,000+', label: 'assets mapped in < 3h' },
  { value: '1,000+', label: 'threat takedowns' },
  { value: '100K+', label: 'mentions analyzed' },
] as const;

export type Experience = {
  role: string;
  company: string;
  url?: string;
  location: string;
  period: string;
  summary?: string;
  points: string[];
  tags?: string[];
};

export const EXPERIENCE: Experience[] = [
  {
    role: 'Co-Founder',
    company: 'Flawtrack',
    url: 'https://flawtrack.com',
    location: 'Kuala Lumpur, MY',
    period: 'Jun 2023 - Present',
    summary:
      "As technical co-founder, I built and managed the platform's entire stack from initial code to production: the core Attack Surface Management (ASM), brand protection, and threat-intel engines, the DevSecOps pipelines, AI/RAG integrations, and the frontend dashboards that turn raw security logs into clear, visual data.",
    points: [
      'Threat Intel: wrote data pipelines and parsers that collected and processed 2B+ stealer leaks.',
      'ASM Scaling: built a distributed scanning engine using hundreds of concurrent instances to map large infrastructures (7,000+ assets) in under 3 hours.',
      'Brand Protection: created a monitoring system that analyzed 100,000+ network mentions, leading to 1,000+ successful threat takedowns.',
      'Client Pentesting: led enterprise penetration tests and delivered technical remediation roadmaps.',
      'Sales & Product: ran technical product demos and contributed directly to marketing strategy.',
    ],
    tags: ['ASM', 'Threat Intel', 'AI / RAG', 'DevSecOps', 'Distributed Systems', 'GCP'],
  },
  {
    role: 'Security Engineer',
    company: 'DeepStrike',
    url: 'https://deepstrike.io',
    location: 'Dubai, UAE',
    period: 'Jan 2022 - Aug 2023',
    points: [
      'Performed penetration testing and security audits for DeepStrike and its clients.',
      'Managed AWS and Cloudflare security services.',
      'Conducted code reviews, collaborating with developers to remediate vulnerabilities.',
      'Integrated security best practices into the SDLC.',
      "Wrote technical contributions for DeepStrike's blog.",
    ],
    tags: ['Pentesting', 'AWS', 'Cloudflare', 'Secure SDLC', 'Code Review'],
  },
  {
    role: 'Bug Bounty Hunter',
    company: 'Independent',
    location: 'Remote',
    period: 'May 2022 - Present',
    points: [
      'Participated in many bug bounty programs, successfully finding and reporting numerous vulnerabilities.',
    ],
    tags: ['Web Exploitation', 'Recon', 'Reporting'],
  },
  {
    role: 'CTF Player',
    company: 'Competitive Security',
    location: 'Worldwide',
    period: 'Sep 2021 - Present',
    points: [
      'Consistently achieved top-percentile rankings across web exploitation, OSINT, and mobile hacking.',
    ],
    tags: ['Web', 'OSINT', 'Mobile'],
  },
];

export type SkillGroup = { title: string; items: string[] };

export const SKILLS: SkillGroup[] = [
  {
    title: 'Offensive Security',
    items: ['Penetration Testing', 'Bug Bounty', 'Web Exploitation', 'OSINT', 'Mobile Hacking'],
  },
  {
    title: 'Security Engineering',
    items: ['Attack Surface Management', 'Threat Intelligence', 'Brand Protection', 'Secure SDLC', 'Code Review'],
  },
  {
    title: 'Cloud & DevSecOps',
    items: ['GCP', 'AWS', 'Cloudflare', 'CI/CD Pipelines', 'Distributed Systems', 'Automation'],
  },
  {
    title: 'Engineering & AI',
    items: ['Backend Development', 'Data Pipelines', 'Frontend Dashboards', 'AI / RAG Integration', 'Third-party APIs'],
  },
];

export const AWARDS = [
  'Organizer at IEEE Victoris 1.0 CTF Competition',
  'Ranked 2nd at CyberTalents July CTF (among 210 players)',
  'Ranked 6th at ASCWG 2022 Finals',
  'Qualified to BlackHat MEA 2022 Finals',
  'Qualified to @hack CTF 2021 Finals',
  'Qualified to CyCTF 2022 Finals',
] as const;

export const CERTIFICATES = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issued: 'Aug 2023',
    expires: 'Aug 2026',
    credentialId: 'JMBJSK7C9BB41G5M',
  },
] as const;

export const TALKS = [
  {
    title: 'Cybersecurity',
    event: 'CAT Reloaded',
    youtube: '9P4AMq9aO3Y',
    url: 'https://www.youtube.com/watch?v=9P4AMq9aO3Y',
  },
] as const;

export const EDUCATION = [
  {
    school: 'Mansoura University',
    program: 'Faculty of Computer & Information Sciences',
    period: '2021 - 2025',
    note: 'Grade: Excellent with Honors',
  },
] as const;

export const VOLUNTEERING = [
  {
    org: 'CAT Reloaded',
    url: 'https://catreloaded.org',
    role: 'Cyber Security Head & Instructor',
    points: [
      'Instructed students and managed department operations for a prominent university organization.',
      'Executed penetration tests on team infrastructure and student graduation projects.',
      'Hosted internal CTF competitions tailored to varying student skill levels.',
    ],
  },
] as const;
