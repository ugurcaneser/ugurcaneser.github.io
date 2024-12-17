import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface PostData {
    id: string;
    date: string;
    title: string;
    content: string;
}

const postsDirectory = path.join(process.cwd(), "src/app/posts");

export async function getSortedPostsData(): Promise<PostData[]> {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, "");

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Combine the data with the id
        return {
            id,
            title: matterResult.data.title,
            date: matterResult.data.date,
            content: matterResult.content
        };
    });
    
    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (new Date(a.date) < new Date(b.date)) {
            return 1;
        } else {
            return -1;
        }
    });
}