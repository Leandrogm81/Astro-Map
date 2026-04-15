declare module 'react-markdown' {
  import { ComponentType, ReactNode } from 'react';
  interface ReactMarkdownProps {
    children?: string;
    components?: Record<string, ComponentType<any>>;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
  }
  const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: any;
  export default remarkGfm;
}
