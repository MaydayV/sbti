import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sbti-iota.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SBTI 人格测试｜傻逼人格测试在线版',
    template: '%s｜SBTI 人格测试',
  },
  description:
    'SBTI（傻逼人格测试）在线测试：自动下一题，输出认证 SBTI 人格类型、维度解读与结果海报，适合社交分享与整活。',
  keywords: [
    'SBTI',
    'SBTI测试',
    '傻逼人格测试',
    '人格测试',
    'MBTI平替',
    '娱乐测试',
    '在线测试',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SBTI 人格测试｜傻逼人格测试在线版',
    description:
      '30+题自动下一题，生成认证 SBTI 人格类型与维度分析。娱乐整活专用，但体验认真。',
    url: '/',
    siteName: 'SBTI 人格测试',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBTI 人格测试',
    description: '在线 SBTI（傻逼人格测试）：快速作答，直接出结果。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: process.env.BAIDU_SITE_VERIFICATION
    ? {
        other: {
          'baidu-site-verification': process.env.BAIDU_SITE_VERIFICATION,
        },
      }
    : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6faf6',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
