import toast from 'react-hot-toast';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const Share = (props: any) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);

        try {
            for (const file of acceptedFiles) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                toast.success(`Successfully uploaded ${file.name}`);
            }
        } catch (error) {
            toast.error('Failed to upload files');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
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
                    <p className="text-sm text-gray-500 mt-1">Supported formats: JPEG, JPG, PNG, GIF</p>
                </div>
            )}
        </div>
    </div>)
}

export default Share;