import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/login'; // Redireciona para login por padrão

  const redirectTo = new URL(request.url);
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

  if (token_hash && type) {
    const { error } = await supabaseAdmin.auth.verifyOtp({
      type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change',
      token_hash,
    });

    if (!error) {
      redirectTo.searchParams.delete('next');
      return NextResponse.redirect(redirectTo.toString());
    }
  }

  redirectTo.pathname = '/error';
  return NextResponse.redirect(redirectTo.toString());
}
