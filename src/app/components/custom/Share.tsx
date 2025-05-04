import toast from 'react-hot-toast';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { put } from '@vercel/blob';

const Share = (props: any) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);

        try {
            for (const file of acceptedFiles) {
                console.log('Starting upload for file:', file.name);
                
                // 1. Get the client token from the server
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'blob.generate-client-token',
                        payload: file.name,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response error:', errorText);
                    throw new Error(`Failed to get upload token: ${errorText}`);
                }

                const responseData = await response.json();
                console.log('Received token response:', responseData);
                
                if (!responseData.clientToken) {
                    throw new Error('No client token received from server');
                }

                // 2. Upload the file using the client token
                console.log('Attempting to upload with token:', responseData.clientToken);
                const { url } = await put(file.name, file, {
                    access: 'public',
                    token: responseData.clientToken,
                });

                console.log('Upload successful, file available at:', url);
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