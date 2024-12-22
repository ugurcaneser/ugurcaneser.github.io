'use client';

import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PostData } from '../../lib/posts';

export default function ClientBlogPost({ post }: { post: PostData }) {
    return (
        <article className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <time className="text-gray-500 text-sm mb-8 block">
                {format(new Date(post.date), 'MMMM dd, yyyy', { locale: enUS })}
            </time>
            <div className="prose prose-lg max-w-none prose-headings:text-black prose-a:text-red-600 hover:prose-a:text-red-800">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({node, ...props}) => <p className="mb-4" {...props} />,
                        a: ({node, ...props}) => <a className="text-red-600 hover:text-red-800" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                        li: ({node, ...props}) => <li className="mb-2" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
                        code: ({node, ...props}) => <code className="bg-gray-100 rounded px-1" {...props} />
                    }}
                >
                    {post.content}
                </ReactMarkdown>
            </div>
        </article>
    );
}