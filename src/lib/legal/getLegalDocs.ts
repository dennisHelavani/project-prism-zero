
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize from 'rehype-sanitize';

export type LegalDoc = { slug: 'privacy'|'terms'|'cookies', title: string, lastUpdated?: string, html: string };

const ORDER: LegalDoc['slug'][] = ['privacy','terms','cookies'];

function toTitle(slug: string) {
  if (slug === 'terms') return 'Terms of Service';
  if (slug === 'cookies') return 'Cookie Policy';
  return 'Privacy Policy';
}

export async function getLegalDocs(): Promise<LegalDoc[]> {
  const dir = path.join(process.cwd(), 'src', 'content', 'legal');
  const files = ['privacy.md', 'terms.md', 'cookies.md'];
  const results: LegalDoc[] = [];

  for (const file of files) {
    const full = path.join(dir, file);
    try {
      const raw = await fs.readFile(full, 'utf8');
      const { data, content } = matter(raw);

      const html = String(
        await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeSanitize)
          .use(rehypeSlug)
          .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
          .use(rehypeStringify)
          .process(content)
      );

      const slug = (data.slug || path.basename(file, '.md')) as LegalDoc['slug'];
      results.push({
        slug,
        title: data.title || toTitle(slug),
        lastUpdated: data.lastUpdated || undefined,
        html
      });
    } catch {
      // Missing file: push empty shell so layout still renders
      const slug = path.basename(file, '.md') as LegalDoc['slug'];
      results.push({ slug, title: toTitle(slug), html: '<p>Content coming soon.</p>' });
    }
  }

  // ensure Privacy, Terms, Cookies order
  return ORDER.map(s => results.find(r => r.slug === s)!).filter(Boolean);
}
