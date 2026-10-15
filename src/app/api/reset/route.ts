import { NextResponse } from 'next/server';
import { resetToDemoData } from '@/lib/db';

export async function POST() {
  try {
    resetToDemoData();
    return NextResponse.json({ success: true, message: 'Datos demo reiniciados con éxito' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
