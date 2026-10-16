import { NextRequest, NextResponse } from 'next/server';
import { getProducts, updateProductParams } from '@/lib/db';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, params } = body;
    if (!productId || !params) {
      return NextResponse.json(
        { success: false, error: 'productId and params are required' },
        { status: 400 }
      );
    }
    const updated = await updateProductParams(productId, params);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
