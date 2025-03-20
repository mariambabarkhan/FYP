import dbConnect from '../../../lib/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "Connected to MongoDB successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Database connection failed!" }, { status: 500 });
  }
}
