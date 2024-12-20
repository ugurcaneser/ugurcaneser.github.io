import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl text-left">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 sm:leading-tight leading-tight	">
              HI , I&apos;M <span className='text-red-600'>UĞURCAN</span> 
            </h1>
            <p className="text-xl text-red-600 mb-8 font-bold">
              SOFTWARE DEVELOPER
            </p>

            {/* Social Media Icons */}
            <div className="flex flex-col space-y-4">
              <Link href="mailto:ugurcaneser@yahoo.com" target="_blank" rel="noopener noreferrer"
                className="text-3xl font-bold text-black hover:text-red-900 transition-colors">
                CONTACT
              </Link>
              <Link href="https://github.com/ugurcaneser" target="_blank" rel="noopener noreferrer"
                className="text-3xl font-bold  text-black hover:text-red-900 transition-colors">
                GITHUB
              </Link>
              <Link href="https://linkedin.com/in/ugurcaneser" target="_blank" rel="noopener noreferrer"
                className="text-3xl font-bold text-black hover:text-red-900 transition-colors">
                LINKEDIN
              </Link>
              <Link href="./blog" className="text-3xl font-bold text-black hover:text-red-900 transition-colors">BLOG</Link>
              <Link href="./gallery" className="text-3xl font-bold text-black hover:text-red-900 transition-colors">GALLERY</Link>
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