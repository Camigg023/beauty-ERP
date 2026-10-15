import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Credenciales demo por defecto: admin@trendybeauty.co / TrendyAdmin2026!
    if (
      (email === 'admin@trendybeauty.co' && password === 'TrendyAdmin2026!') ||
      (email === 'admin' && password === 'admin')
    ) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'usr-1',
          name: 'Camila Directora de Operaciones',
          email: 'admin@trendybeauty.co',
          role: 'ADMIN',
        },
      });

      // Set cookie de sesión
      response.cookies.set({
        name: 'beauty_crm_session',
        value: 'authenticated_admin',
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Credenciales inválidas. Usa admin@trendybeauty.co / TrendyAdmin2026!' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada' });
  response.cookies.set({
    name: 'beauty_crm_session',
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}
