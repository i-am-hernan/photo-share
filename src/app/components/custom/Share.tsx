import toast from 'react-hot-toast';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { put } from '@vercel/blob';
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import imageCompression from 'browser-image-compression';
import heicConvert from 'heic-convert';

const Share = (props: any) => {
    const [uploading, setUploading] = useState(false);

    const convertHeicToJpeg = async (file: File): Promise<File> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const jpegBuffer = await heicConvert({
                buffer: buffer,
                format: 'JPEG',
                quality: 0.9
            });

            return new File([jpegBuffer], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: file.lastModified,
            });
        } catch (error) {
            console.error('Error converting HEIC to JPEG:', error);
            throw new Error('Failed to convert HEIC file');
        }
    };

    const compressImage = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };

        try {
            const compressedFile = await imageCompression(file, options);
            return new File([compressedFile], file.name, {
                type: file.type,
                lastModified: file.lastModified,
            });
        } catch (error) {
            console.error('Error compressing image:', error);
            return file; // Return original file if compression fails
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);

        try {
            for (const file of acceptedFiles) {
                // Convert HEIC to JPEG if needed
                let fileToProcess = file;
                if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                    fileToProcess = await convertHeicToJpeg(file);
                }

                // Compress if file is larger than 10MB
                const fileToUpload = fileToProcess.size > 10 * 1024 * 1024 
                    ? await compressImage(fileToProcess)
                    : fileToProcess;

                const newBlob = await upload(fileToUpload.name, fileToUpload, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                });

                if (!newBlob) {
                    throw new Error(`Failed to upload file`);
                }

                toast.success(`Successfully uploaded ${file.name}`);
            }
        } catch (error) {
            console.error('Upload error details:', error);
            toast.error('Failed to upload files');
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.webp']
        }
    });

    return (<div className="max-w-2xl mx-auto px-2">
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-[#9b8579] bg-[#f5f2f0]' : 'border-gray-300 hover:border-[#9b8579]'}`}
        >
            <input className="h-100" {...getInputProps()} />
            {uploading ? (
                <p className="text-gray-600">Uploading...</p>
            ) : isDragActive ? (
                <p className="text-[#9b8579]">Drop the files here...</p>
            ) : (
                <div>
                    <p className="text-gray-600">Drag and drop your wedding photos here, or click to select files</p>
                    <p className="text-sm text-gray-500 mt-2">Help us capture every moment of our special day!</p>
                    <p className="text-sm text-gray-500 mt-1">Supported formats: JPEG, PNG, HEIC, WebP</p>
                </div>
            )}
        </div>
    </div>)
}

export default Share;