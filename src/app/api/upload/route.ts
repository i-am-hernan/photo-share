import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                const options = {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
                    validUntil: Date.now() + 3600000, // 1 hour from now
                };
                console.log('Token generation options:', options);
                return options;
            },
            onUploadCompleted: async ({ blob }) => {
                console.log('Upload completed successfully:', blob);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 400 }
        );
    }
} 