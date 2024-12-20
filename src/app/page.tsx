import Link from 'next/link'
import { FaLinkedinIn, FaGithub, FaRegEnvelope } from "react-icons/fa6";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl text-left">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Hi, I&apos;m <span className='text-red-600'>Uğurcan</span> 
            </h1>
            <p className="text-xl text-gray-600 mb-8 font-extralight">
              🚀 An experienced professional specializing in
              <span className='text-red-600'> software development</span>.
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-5">
            <Link href="mailto:ugurcaneser@yahoo.com" target="_blank" rel="noopener noreferrer"
                className="text-black hover:text-red-900 transition-colors">
                <FaRegEnvelope className="w-7 h-7" />
              </Link>
              <Link href="https://github.com/ugurcaneser" target="_blank" rel="noopener noreferrer"
                className="text-black hover:text-red-900 transition-colors">
                <FaGithub className="w-7 h-7" />
              </Link>
              <Link href="https://linkedin.com/in/ugurcaneser" target="_blank" rel="noopener noreferrer"
                className="text-black hover:text-red-900 transition-colors">
                <FaLinkedinIn className="w-7 h-7" />
              </Link>
              <Link href="./blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
              <Link href="./gallery" className="text-gray-600 hover:text-gray-900">Gallery</Link>
             
            </div>
          </div>
        </div>
      </section>

      {/* Footer
      <footer className="bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            &copy; 2024 Web'de Güzel Bir Yer. All rights reserved.
          </div>
        </div>
      </footer> */}
    </main>
  )
}