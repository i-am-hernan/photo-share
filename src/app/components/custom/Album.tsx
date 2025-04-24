import { useEffect, useState, useRef, useCallback } from "react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
} from "../../components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

interface ImageDimensions {
    width: number;
    height: number;
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
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const preloadedImages = useRef<Set<string>>(new Set());
    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchPhotos = async (cursor?: string) => {
        if (album.loading) return; // Prevent multiple simultaneous fetches
        
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
                data: cursor ? [...prev.data, ...blobs] : blobs,
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

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && album.hasMore && !album.loading) {
                    fetchPhotos(album.cursor!);
                }
            },
            { threshold: 0.1 } // Trigger when 10% of the target is visible
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [album.hasMore, album.loading, album.cursor]);

    // Preload next image
    useEffect(() => {
        if (selectedImageIndex >= 0 && selectedImageIndex < album.data.length - 1) {
            const nextImage = album.data[selectedImageIndex + 1];
            if (nextImage && !preloadedImages.current.has(nextImage.url)) {
                const img = document.createElement('img');
                img.src = nextImage.url;
                preloadedImages.current.add(nextImage.url);
            }
        }
    }, [selectedImageIndex, album.data]);

    const calculateDimensions = (naturalWidth: number, naturalHeight: number) => {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        
        let width = naturalWidth;
        let height = naturalHeight;
        
        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
        }
        
        if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width = width * ratio;
        }
        
        return { width, height };
    };

    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.target as HTMLImageElement;
        const dimensions = calculateDimensions(img.naturalWidth, img.naturalHeight);
        setImageDimensions(dimensions);
        setIsImageLoaded(true);
        setIsTransitioning(false);
    };

    const handleImageClick = (photo: BlobItem, index: number) => {
        setSelectedImage(photo);
        setSelectedImageIndex(index);
        setIsDialogOpen(true);
    };

    const handlePreviousImage = () => {
        if (selectedImageIndex > 0) {
            setIsTransitioning(true);
            const newIndex = selectedImageIndex - 1;
            setSelectedImage(album.data[newIndex]);
            setSelectedImageIndex(newIndex);
        }
    };

    const handleNextImage = () => {
        if (selectedImageIndex < album.data.length - 1) {
            setIsTransitioning(true);
            const newIndex = selectedImageIndex + 1;
            setSelectedImage(album.data[newIndex]);
            setSelectedImageIndex(newIndex);
        } else if (album.hasMore) {
            fetchPhotos(album.cursor!).then(() => {
                const newIndex = album.data.length;
                setSelectedImage(album.data[newIndex]);
                setSelectedImageIndex(newIndex);
            });
        }
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImage && isDialogOpen) {
                if (e.key === 'ArrowLeft') {
                    handlePreviousImage();
                } else if (e.key === 'ArrowRight') {
                    handleNextImage();
                } else if (e.key === 'Escape') {
                    setIsDialogOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, selectedImageIndex, album.data, album.hasMore, album.cursor, isDialogOpen]);

    if (album.error) return <div>Error: {album.error}</div>;

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
                {album.data.map((photo, i) => (
                    <div 
                        key={i}
                        className="aspect-square relative overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 group h-[200px] cursor-pointer"
                        onClick={() => handleImageClick(photo, i)}
                    >
                        <Image
                            src={`${photo.url}`}
                            alt={`${photo.pathname}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                            quality={85}
                        />
                    </div>
                ))}
            </div>

            {/* Infinite scroll observer target */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {album.loading && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent 
                    className="p-0 border-none shadow-none overflow-hidden" 
                    style={{ 
                        backgroundColor: 'transparent',
                        width: isImageLoaded ? `${imageDimensions.width}px` : 'auto',
                        height: isImageLoaded ? `${imageDimensions.height}px` : 'auto',
                        maxWidth: '90vw',
                        maxHeight: '90vh'
                    }}
                >
                    {selectedImage && (
                        <div className="relative w-full h-full">
                            <Image
                                src={selectedImage.url}
                                alt={selectedImage.pathname}
                                width={imageDimensions.width || 800}
                                height={imageDimensions.height || 600}
                                className={`object-contain transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                                quality={100}
                                priority
                                onLoad={handleImageLoad}
                            />
                            
                            {/* Navigation buttons */}
                            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                                <button 
                                    onClick={handlePreviousImage}
                                    className={`p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors pointer-events-auto
                                        ${selectedImageIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    disabled={selectedImageIndex <= 0 || isTransitioning}
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                
                                <button 
                                    onClick={handleNextImage}
                                    className={`p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors pointer-events-auto
                                        ${selectedImageIndex >= album.data.length - 1 && !album.hasMore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    disabled={selectedImageIndex >= album.data.length - 1 && !album.hasMore || isTransitioning}
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </div>
                            
                            {/* Image counter */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/30 text-white px-3 py-1 rounded-full text-sm pointer-events-none">
                                {selectedImageIndex + 1} / {album.data.length}
                                {album.hasMore && selectedImageIndex === album.data.length - 1 && '+'}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Album;