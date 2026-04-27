import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password, isGuest } = await request.json();

    // Fluxo de Visitante
    if (isGuest) {
      // Verificar se já existe um cookie de visitante para evitar reset de créditos
      const existingRole = request.headers.get('cookie')?.split('; ')
        .find(row => row.startsWith('astromap_role='))
        ?.split('=')[1];
      
      const roleToSet = existingRole?.startsWith('guest:') ? existingRole : 'guest:n1t1r1e1';
      const response = NextResponse.json({ success: true, role: roleToSet });
      
      const duration = 60 * 60 * 24 * 3; // 3 dias

      // Cookie de sessão (Segurança)
      response.cookies.set('astromap_session', roleToSet, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: duration,
      });

      // Cookie de Role (Acessível por JS para UI)
      response.cookies.set('astromap_role', roleToSet, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: duration,
      });

      return response;
    }

    // Fluxo de Administrador
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      return NextResponse.json(
        { error: 'Credenciais não configuradas no servidor' },
        { status: 500 }
      );
    }

    if (username === validUsername && password === validPassword) {
      const response = NextResponse.json({ success: true, role: 'admin' });
      
      const duration = 60 * 60 * 24 * 30; // 30 dias

      // Cookie de sessão
      response.cookies.set('astromap_session', 'admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: duration,
      });

      // Cookie de Role
      response.cookies.set('astromap_role', 'admin', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: duration,
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Usuário ou senha incorretos' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao processar login' },
      { status: 500 }
    );
  }
}
