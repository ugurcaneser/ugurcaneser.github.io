'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { FaHandPointLeft, FaXmark } from "react-icons/fa6";

const photos = [
    {
        id: 1,
        src: '/images/gallery/photo1.jpg',
        alt: 'Photo 1',
        width: 4032,
        height: 3024
    },
    {
        id: 2,
        src: '/images/gallery/photo2.jpg',
        alt: 'Photo 2',
        width: 3072,
        height: 4096
    },
    {
        id: 3,
        src: '/images/gallery/photo3.jpg',
        alt: 'Photo 3',
        width: 5712,
        height: 4284
    },
    {
        id: 4,
        src: '/images/gallery/photo4.jpg',
        alt: 'Photo 4',
        width: 4096,
        height: 3072
    },
    {
        id: 5,
        src: '/images/gallery/photo5.jpg',
        alt: 'Photo 5',
        width: 4032,
        height: 2268
    },
    {
        id: 6,
        src: '/images/gallery/photo6.jpg',
        alt: 'Photo 6',
        width: 3024,
        height: 4032
    },
    {
        id: 7,
        src: '/images/gallery/photo7.jpg',
        alt: 'Photo 7',
        width: 4032,
        height: 3024
    },
    {
        id: 8,
        src: '/images/gallery/photo8.jpg',
        alt: 'Photo 8',
        width: 4032,
        height: 3024
    },
    {
        id: 9,
        src: '/images/gallery/photo9.jpg',
        alt: 'Photo 9',
        width: 4096,
        height: 3072
    },
    {
        id: 10,
        src: '/images/gallery/photo10.jpg',
        alt: 'Photo 10',
        width: 4096,
        height: 3072
    },
];

export default function Gallery() {
    const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/" className="text-2xl text-red-600 hover:text-red-800 mb-4 inline-block">
                <FaHandPointLeft />
            </Link>
            <h1 className="text-4xl font-bold mb-8 text-center">GALLERY</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                    <div 
                        key={photo.id} 
                        className="relative h-64 hover:opacity-90 transition-opacity cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                    >
                        <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover rounded-lg"
                            priority={photo.id <= 4}
                        />
                    </div>
                ))}
            </div>

                   {/* Modal */}
                   {selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
                    onClick={() => setSelectedPhoto(null)}
                >
                                        <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-2 md:mx-4">
                        <button
                            className="absolute right-0 md:-right-12 top-0 z-[10000] text-white bg-black/50 p-2 rounded-lg md:rounded-lg hover:bg-black/70 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto(null);
                            }}
                        >
                            <FaXmark size={24} />
                        </button>
                        <Image
                            src={selectedPhoto.src}
                            alt={selectedPhoto.alt}
                            fill
                            className="object-contain"
                            sizes="90vw"
                            priority
                            quality={100}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}