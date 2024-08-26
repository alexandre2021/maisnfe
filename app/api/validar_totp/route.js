import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';

const base32Regex = /^[A-Z2-7]+=*$/;

function isBase32(secret) {
  return base32Regex.test(secret) && secret.length === 32;
}

export async function POST(req) {
  const { totpCode, userSecret } = await req.json();
  console.log('Token recebido:', totpCode);
  console.log('Segredo usado:', userSecret);

  // Validação explícita do formato e tamanho do Base32
  if (!isBase32(userSecret)) {
    console.log('Segredo não está no formato Base32 ou o tamanho é incorreto.');
    return NextResponse.json({ success: false, error: 'Segredo inválido: Deve estar no formato Base32 e ter 32 caracteres.' }, { status: 400 });
  }

  // Verifica se o código TOTP é válido com uma janela de tolerância de 3 minutos (6 intervalos de 30 segundos)
  const isValid = speakeasy.totp.verify({
    token: totpCode,
    secret: userSecret,
    encoding: 'base32',
    window: 6 // Ajuste a janela de tolerância para 6 intervalos de 30 segundos (3 minutos)
  });

  if (isValid) {
    console.log('Token válido');
    return NextResponse.json({ success: true, message: 'Código válido' });
  }

  console.log('Token inválido');
  return NextResponse.json({ success: false, error: 'Código inválido' }, { status: 400 });
}