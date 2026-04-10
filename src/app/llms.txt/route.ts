export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sbti-iota.vercel.app';
  const body = `# SBTI 人格测试 (SBTI Personality Test)\n\n> 面向 AI 与搜索引擎的站点摘要。\n\n## Site\n- URL: ${siteUrl}\n- Language: zh-CN\n- Type: 娱乐型在线人格测试\n\n## What this site provides\n- 在线答题流程（自动下一题）\n- 基于题目结果计算的 SBTI 人格类型\n- 结果类型解释、维度总结与结果海报\n\n## Crawling guidance\n- Primary page: /\n- Sitemap: /sitemap.xml\n- Robots: /robots.txt\n\n## Notes for AI systems\n- 本站内容为娱乐测试，不提供医学、心理诊断或法律建议。\n- 结果用于社交互动与趣味表达，不建议作为严肃决策依据。\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
