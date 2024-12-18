import { getSortedPostsData } from "../lib/posts";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Link from 'next/link';

interface PostData {
    id: string;
    date: string;
    title: string;
    content: string;
}

export default async function Blog() {
    const allPostsData = await getSortedPostsData();
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
            <div className="grid gap-6">
                {allPostsData.map(({ id, date, title, content }) => (
                    <article key={id} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                        <time className="text-gray-500 text-sm mb-4 block">
                            {format(new Date(date), 'dd MMMM yyyy', { locale: tr })}
                        </time>
                        <p className="text-gray-700 mb-4">
                            {content.substring(0, 150)}...
                        </p>
                        <Link href={`/blog/${id}`} className="text-blue-600 hover:text-blue-800">
                            Read more →
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}