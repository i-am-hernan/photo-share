import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Generate a client token for the browser to upload the file
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
                    validUntil: Date.now() + 3600000, // 1 hour from now
                };
            },
            onUploadCompleted: async ({ blob }) => {
                console.log('blob upload completed', blob);
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