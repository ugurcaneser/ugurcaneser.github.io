"use client";

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  const links = [
    { href: "./projects", text: "PROJECTS" },
    { href: "mailto:ugurcaneser@yahoo.com", text: "CONTACT" },
    { href: "https://github.com/ugurcaneser", text: "GITHUB" },
    { href: "https://linkedin.com/in/ugurcaneser", text: "LINKEDIN" },
    // { href: "./blog", text: "BLOG" },
    { href: "./gallery", text: "GALLERY" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: -20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const slideIn = {
    hidden: { opacity: 0, x: -100 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl text-left">
          <motion.h1 
              className="text-6xl font-bold text-black mb-6 sm:leading-tight leading-tight"
              variants={slideIn}
              initial="hidden"
              animate="show"
            >
              <motion.span
                animate={{
                  rotate: [0, 20, -20, 20, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                style={{ display: 'inline-block', transformOrigin: '70% 70%' }}
              >
                👋
              </motion.span>
              {' '}HI! I&apos;M UĞURCAN 
            </motion.h1>
            <motion.p 
              className="text-xl text-black mb-8 font-bold"
              variants={slideIn}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
            >
              SOFTWARE DEVELOPER
            </motion.p>

            {/* Social Media Icons */}
            <motion.div 
              className="flex flex-col space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {links.map((link, index) => (
                <motion.div key={index} variants={item}>
                  <Link 
                    href={link.href} 
                    target={link.href.startsWith('http') || link.href.startsWith('mailto') ? "_blank" : undefined}
                    rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                    className="text-3xl font-bold text-black hover:text-red-900 transition-colors"
                  >
                    {link.text}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}