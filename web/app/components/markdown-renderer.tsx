import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

import { cn } from "~/lib/utils";

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1(props) {
            return <h1 className="text-4xl font-bold mb-4 mt-2" {...props} />;
          },
          h2(props) {
            return <h2 className="text-3xl font-bold mb-4 mt-2" {...props} />;
          },
          h3(props) {
            return <h3 className="text-2xl font-bold mb-4 mt-2" {...props} />;
          },
          h4(props) {
            return <h4 className="text-xl font-bold mb-4 mt-2" {...props} />;
          },
          h5(props) {
            return <h5 className="text-lg font-bold mb-4 mt-2" {...props} />;
          },
          h6(props) {
            return <h6 className="text-base font-bold mb-4 mt-2" {...props} />;
          },
          p(props) {
            return <p className="my-2" {...props} />;
          },
          a(props) {
            return <a className="text-primary underline" {...props} />;
          },
          ul(props) {
            return <ul className="my-4 list-disc pl-6" {...props} />;
          },
          ol(props) {
            return <ol className="my-4 list-decimal pl-6" {...props} />;
          },
          table(props) {
            return (
              <table
                className="table-auto border-collapse w-full my-4"
                {...props}
              />
            );
          },
          th(props) {
            return <th className="border px-4 py-2 bg-muted" {...props} />;
          },
          td(props) {
            return <td className="border px-4 py-2" {...props} />;
          },
          // TODO: scroll code block
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                language={match[1]}
                style={vscDarkPlus}
                wrapLongLines={true}
                wrapLines={true}
                breakLines={true}
              />
            ) : (
              <code {...rest} className={cn(className, "bg-muted px-1")}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
