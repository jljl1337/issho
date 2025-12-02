import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "prose dark:prose-invert max-w-none break-all",
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      {/* TODO: break word in code block */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
