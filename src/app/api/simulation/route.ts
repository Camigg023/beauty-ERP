import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/db';
import { simulate12Weeks } from '@/lib/calculations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, policyOverride, demandNoise, initialStockOverride } = body;

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const params = {
      ...product.params,
      policy: policyOverride || product.params.policy,
    };

    const initialStock = initialStockOverride !== undefined ? Number(initialStockOverride) : product.currentStock;
    const result = simulate12Weeks(initialStock, params, product.calculations, Boolean(demandNoise));
    result.productId = product.id;

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
