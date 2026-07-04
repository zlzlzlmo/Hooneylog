export const AUTHOR = {
  name: 'Seunghoon Shin',
  koreanName: '신승훈',
  tagline: '기록과 함께 성장하는 풀스택 개발자',
  role: '프론트엔드에서 백엔드·인프라까지, 제품을 끝까지 만드는 풀스택 개발자',
  avatar: '/images/profile.png',
  openToWork: true,
  links: {
    github: 'https://github.com/zlzlzlmo',
    linkedin: 'https://linkedin.com/in/seunghoon-shin',
    velog: 'https://velog.io/@hoon_dev',
    email: 'mailto:zlzlzlmo60@gmail.com',
  },
} as const;

export const AUTHOR_SOCIALS = [
  { label: 'GitHub', href: AUTHOR.links.github },
  { label: 'LinkedIn', href: AUTHOR.links.linkedin },
  { label: 'velog', href: AUTHOR.links.velog },
  { label: 'Email', href: AUTHOR.links.email },
] as const;
