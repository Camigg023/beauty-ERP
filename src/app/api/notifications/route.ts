import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, resolveNotification } from '@/lib/db';

export async function GET() {
  try {
    const alerts = getNotifications();
    return NextResponse.json({ success: true, data: alerts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }
    const resolved = resolveNotification(id);
    return NextResponse.json({ success: true, resolved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
