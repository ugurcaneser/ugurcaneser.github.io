'use client';

import Image from 'next/image';

interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'mobile' | 'game';
  link: string;
  appStoreLink?: string;
}

const projects: Project[] = [
  {
    id: 'project1',
    title: 'Budgetory',
    description: 'Track your budget easily',
    icon: '/images/project_icons/budgetory.png',
    type: 'mobile',
    link: '/projects/project1',
    appStoreLink: 'https://apps.apple.com/tr/app/budgetory/id6740176453',
  },
];

export default function Projects() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg  p-6">
            <div className="flex items-center justify-center mb-4">
              <Image
                src={project.icon}
                alt={`${project.title} icon`}
                width={128}
                height={128}
                className="rounded-lg"
              />
            </div>
            <h2 className="text-xl text-center font-semibold mb-2">{project.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">{project.description}</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${project.type === 'mobile'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                  {project.type === 'mobile' ? 'Mobile App' : 'Game'}
                </span>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                {project.appStoreLink && (
                  <a
                    href={project.appStoreLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white px-16 py-2 rounded-lg text-center"
                  >
                    App Store
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}