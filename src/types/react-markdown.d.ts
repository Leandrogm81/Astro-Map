declare module 'react-markdown' {
  import { ComponentType } from 'react';
  interface ReactMarkdownProps {
    children?: string;
    components?: Record<string, ComponentType<Record<string, unknown>>>;
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
  }
  const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: unknown;
  export default remarkGfm;
}
