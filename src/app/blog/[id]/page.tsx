import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getSortedPostsData } from '../../lib/posts';
import { Metadata } from 'next';

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}): Promise<Metadata> {
    const { id } = await params;
    const posts = await getSortedPostsData();
    const post = posts.find((p) => p.id === id);

    return {
        title: post?.title || 'Blog Post',
        description: post?.content.substring(0, 160) || 'Blog post content',
    };
}

export async function generateStaticParams() {
    const posts = await getSortedPostsData();
    return posts.map((post) => ({
        id: post.id,
    }));
}

export default async function BlogPost({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const { id } = await params;
    const posts = await getSortedPostsData();
    const post = posts.find((p) => p.id === id);

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <article className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <time className="text-gray-500 text-sm mb-8 block">
                {format(new Date(post.date), 'MMMM dd, yyyy', { locale: enUS })}
            </time>
            <div className="prose prose-lg">
                {post.content}
            </div>
        </article>
    );
}