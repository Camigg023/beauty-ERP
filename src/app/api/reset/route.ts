import { NextResponse } from 'next/server';
import { resetToDemoData } from '@/lib/db';

export async function POST() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_RESET !== 'true') {
    return NextResponse.json({ success: false, error: 'Reset deshabilitado en producción' }, { status: 403 });
  }

  try {
    await resetToDemoData();
    return NextResponse.json({ success: true, message: 'Datos demo reiniciados con éxito' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
