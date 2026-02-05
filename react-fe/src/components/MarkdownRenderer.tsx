import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Props {
  content: string
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="markdown-content leading-relaxed text-gray-800 break-words">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            return isInline ? (
              <code
                className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
                className="rounded-lg border border-gray-200 !bg-gray-50"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold mt-6 mb-2 pb-2 border-b border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-5 mb-2 pb-2 border-b border-gray-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => <ul className="my-3 pl-6 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 pl-6 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="my-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 border-l-4 border-gray-300 bg-gray-50 py-2 text-gray-600">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <table className="my-4 w-full border-collapse border border-gray-300">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2">{children}</td>
          ),
          hr: () => <hr className="my-6 border-t border-gray-200" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded my-2"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
