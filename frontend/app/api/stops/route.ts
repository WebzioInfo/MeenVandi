import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Temporary mock data - replace with actual database call
    const stops = [
      {
        id: '1',
        name: 'Fisherman\'s Wharf',
        address: '123 Harbor Drive',
        latitude: 37.8080,
        longitude: -122.4170,
        type: 'selling_spot',
        status: 'approved'
      },
      {
        id: '2', 
        name: 'Market Street Fish Stop',
        address: '456 Market Street',
        latitude: 37.7749,
        longitude: -122.4194,
        type: 'selling_spot',
        status: 'approved'
      }
    ];

    return NextResponse.json({ stops });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stops' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Handle stop creation
    return NextResponse.json({ message: 'Stop created successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create stop' },
      { status: 500 }
    );
  }
}