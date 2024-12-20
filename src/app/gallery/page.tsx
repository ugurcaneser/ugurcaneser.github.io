'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { FaHouse } from "react-icons/fa6";

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
];

export default function Gallery() {
    const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/" className="text-2xl text-red-600 hover:text-red-800 mb-4 inline-block">
                <FaHouse />
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
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
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