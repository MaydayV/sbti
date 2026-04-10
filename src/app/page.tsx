import { QuizApp } from '@/components/quiz-app';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sbti-iota.vercel.app';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SBTI 人格测试',
  description:
    'SBTI（傻逼人格测试）在线测试，支持自动下一题并输出认证 SBTI 人格类型与维度分析。',
  inLanguage: 'zh-CN',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'All',
  url: siteUrl,
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY',
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <QuizApp />
      </main>
    </>
  );
}
