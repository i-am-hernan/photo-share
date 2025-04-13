import { useEffect, useState } from "react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../../components/ui/dialog";

interface BlobItem {
    url: string;
    pathname: string;
    size: number;
    uploadedAt: Date;
}

interface AlbumState {
    error: string | null;
    loading: boolean;
    data: BlobItem[];
    hasMore: boolean;
    cursor: string | null;
}

const Album = () => {
    const [album, setAlbum] = useState<AlbumState>({
        error: null,
        loading: false,
        data: [],
        hasMore: false,
        cursor: null
    });
    
    const [selectedImage, setSelectedImage] = useState<BlobItem | null>(null);

    const fetchPhotos = async (cursor?: string) => {
        setAlbum(prev => ({ ...prev, loading: true }));
        try {
            const params = new URLSearchParams();
            if (cursor) params.append('cursor', cursor);
            params.append('limit', '20');

            const response = await fetch(`/api/album?${params.toString()}`);
            if (!response.ok) {
                throw new Error('failed to retrieve photos');
            }

            const { blobs, hasMore, cursor: nextCursor } = await response.json();

            setAlbum(prev => ({
                error: null,
                loading: false,
                data: cursor ? [...prev.data, ...blobs] : blobs, // Append or replace based on if it's initial load
                hasMore,
                cursor: nextCursor
            }));
        } catch (error) {
            setAlbum(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'An error occurred',
                loading: false
            }));
        }
    };

    // Initial load
    useEffect(() => {
        fetchPhotos();
    }, []);

    if (album.error) return <div>Error: {album.error}</div>;

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
                {album.data.map((photo, i) => (
                    <Dialog key={i}>
                        <DialogTrigger asChild>
                            <div 
                                className="aspect-square relative overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 group h-[200px] cursor-pointer"
                                onClick={() => setSelectedImage(photo)}
                            >
                                <Image
                                    src={`${photo.url}`}
                                    alt={`${photo.pathname}`}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    quality={85}
                                />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
                            <div className="relative w-full h-[80vh]">
                                <Image
                                    src={photo.url}
                                    alt={photo.pathname}
                                    fill
                                    className="object-contain"
                                    quality={100}
                                    priority
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>

            {album.loading && (
                <div className="flex justify-center my-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}

            {album.hasMore && !album.loading && (
                <div className="flex justify-center my-4">
                    <button
                        onClick={() => fetchPhotos(album.cursor!)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default Album;