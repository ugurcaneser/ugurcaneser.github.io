import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getSortedPostsData } from '../../lib/posts';
import { Metadata } from 'next';
import ClientBlogPost from './ClientBlogPost';

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

    return <ClientBlogPost post={post} />;
}