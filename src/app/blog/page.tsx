import { getSortedPostsData, PostData } from "../lib/posts";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Link from 'next/link';
import { FaHandPointLeft } from "react-icons/fa6";


export default async function Blog() {
    const allPostsData: PostData[] = await getSortedPostsData();
    
    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/" className="text-2xl text-red-600 hover:text-red-800 mb-4 inline-block">
            <FaHandPointLeft />
            </Link>
            <h1 className="text-3xl font-bold mb-8 text-center">BLOG</h1>
            <div className="grid gap-6">
                {allPostsData.map(({ id, date, title, content }) => (
                    <article key={id} className="p-6 bg-white rounded-lg text-black transition-shadow">
                        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                        <time className="text-gray-500 text-sm mb-4 block">
                            {format(new Date(date), 'MMMM dd, yyyy', { locale: enUS })}
                        </time>
                        <p className="text-gray-700 mb-4">
                            {content.substring(0, 150)}...
                        </p>
                        <Link href={`/blog/${id}`} className="text-red-600 hover:text-red-900">
                            Read more →
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}