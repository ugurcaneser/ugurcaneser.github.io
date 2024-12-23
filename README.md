# Personal Website

Welcome to my personal portfolio website repository! This website showcases my professional experience, projects, and blog posts about Mobile App Development and Data Science.

## 🚀 Technologies Used

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Typography**: Poppins font family
- **Icons**: React Icons
- **Blog**: [React Markdown](https://github.com/remarkjs/react-markdown) with [remark-gfm](https://github.com/remarkjs/remark-gfm)
- **Deployment**: GitHub Pages

## 🛠️ Local Development

To run this project locally, follow these steps:

```bash
# Clone the repository
git clone https://github.com/ugurcaneser/ugurcaneser.github.io.git

# Navigate to the project directory
cd ugurcaneser.github.io

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📝 Project Structure

```
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── page.tsx    # Homepage
│   │   ├── blog/       # Blog posts and rendering components
│   │   │   └── [id]/   # Dynamic blog post routes
│   │   ├── lib/        # Utility functions
│   │   └── layout.tsx  # Root layout
│   └── components/     # Reusable components
├── public/            # Static assets
└── tailwind.config.ts # Tailwind CSS configuration
```
## 📝 Blog Page

The blog page of this website presents a collection of blog posts with the following features:

- **Data Fetching**: Utilizes an asynchronous function to fetch and sort blog post data.
- **Responsive Design**: Styled with Tailwind CSS for a clean and responsive layout.
- **Navigation**: Includes a link to return to the homepage, enhanced with React Icons.
- **Post Display**: Each post is displayed with a title, publication date, and a content snippet, arranged in a grid format for easy navigation and reading.

## 📸 Gallery Page

The gallery page of this website showcases a collection of photos using the following technologies:

- **Image Handling**: Utilizes Next.js `Image` component for optimized image loading.
- **Navigation**: Uses Next.js `Link` component for seamless client-side transitions.
- **Icons**: Features icons from the `react-icons/fa6` package for interactive elements.

Each photo is displayed with specific dimensions to ensure a consistent layout and appearance across devices.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
