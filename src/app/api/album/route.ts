import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        // Get the URL object to parse search params
        const { searchParams } = new URL(request.url);
        
        // Get pagination parameters from query string
        const cursor = searchParams.get('cursor') || undefined;
        const limit = Number(searchParams.get('limit')) || 20; // default to 20 items

        const response = await list({
            limit,
            cursor: cursor || undefined,
        });

        return NextResponse.json({
            blobs: response.blobs,
            hasMore: response.hasMore,
            cursor: response.cursor,
        });
    } catch (error) {
        console.error('Error fetching photos:', error);
        return NextResponse.json({ error: 'Failed to retrieve photos' }, { status: 500 })
    }
}