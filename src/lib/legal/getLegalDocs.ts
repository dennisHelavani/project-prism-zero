
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize from 'rehype-sanitize';
import {unified} from 'unified';

const legalDir = path.join(process.cwd(), 'src', 'content', 'legal');

export type LegalDoc = {
  slug: string;
  title: string;
  lastUpdated: string | null;
  html: string;
};

export async function getLegalDocs(): Promise<LegalDoc[]> {
  const filenames = fs.readdirSync(legalDir);
  const docs = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '');
      const fullPath = path.join(legalDir, filename);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);

      const processedContent = await unified()
        .use(remark)
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
        .use(rehypeSanitize)
        .process(content);
      
      const html = processedContent.toString();

      return {
        slug,
        title: data.title || 'Untitled',
        lastUpdated: data.lastUpdated || null,
        html,
      };
    })
  );

  const order = ['privacy', 'terms', 'cookies'];
  return docs.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}
