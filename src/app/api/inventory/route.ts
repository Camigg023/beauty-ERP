import { NextRequest, NextResponse } from 'next/server';
import { getKardex, recordInventoryAdjustment } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;
    const kardex = getKardex(productId);
    return NextResponse.json({ success: true, data: kardex });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, newStock, reason } = body;
    if (!productId || newStock === undefined) {
      return NextResponse.json(
        { success: false, error: 'productId and newStock are required' },
        { status: 400 }
      );
    }
    const result = recordInventoryAdjustment({
      productId,
      newStock: Number(newStock),
      reason: reason || 'Ajuste manual de inventario',
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
