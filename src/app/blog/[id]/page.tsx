import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getSortedPostsData } from '../../lib/posts';

interface PostData {
    id: string;
    title: string;
    date: string;
    content: string;
}

export async function generateStaticParams() {
    const posts = await getSortedPostsData();
    return posts.map((post) => ({
        id: post.id,
    }));
}

export default async function BlogPost({ params }: { params: { id: string } }) {
    const posts = await getSortedPostsData();
    const post = posts.find((p) => p.id === params.id);

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <article className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <time className="text-gray-500 text-sm mb-8 block">
                {format(new Date(post.date), 'dd MMMM yyyy', { locale: tr })}
            </time>
            <div className="prose prose-lg">
                {post.content}
            </div>
        </article>
    );
}