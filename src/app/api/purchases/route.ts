import { NextRequest, NextResponse } from 'next/server';
import { createPurchaseOrder, getPurchaseOrders, receivePurchaseOrder } from '@/lib/db';

export async function GET() {
  try {
    const orders = getPurchaseOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, supplier, notes } = body;
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'productId and positive quantity are required' },
        { status: 400 }
      );
    }
    const order = createPurchaseOrder({
      productId,
      quantity: Number(quantity),
      supplier,
      notes,
    });
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }
    const result = receivePurchaseOrder(orderId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
