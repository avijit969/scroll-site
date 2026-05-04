import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const frameNumber = String(number).padStart(6, '0');
  const url = `https://showcase2.piyushsingh123443.workers.dev/frames-webp/frame_${frameNumber}.webp`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Frame not found' }, { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching frame:', error);
    return NextResponse.json({ error: 'Failed to fetch frame' }, { status: 500 });
  }
}
