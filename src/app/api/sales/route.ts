import { NextRequest, NextResponse } from 'next/server';
import { getSales, recordSale } from '@/lib/db';

export async function GET() {
  try {
    const sales = await getSales();
    return NextResponse.json({ success: true, data: sales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, channel, customerName } = body;
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'productId and a positive quantity are required' },
        { status: 400 }
      );
    }
    const result = await recordSale({
      productId,
      quantity: Number(quantity),
      channel: channel || 'TIENDA_ONLINE',
      customerName: customerName || 'Cliente Mostrador',
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
