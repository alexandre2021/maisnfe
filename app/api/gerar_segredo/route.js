import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function GET() {
  // Gera um segredo de 20 caracteres no formato Base32
  const secret = speakeasy.generateSecret({ length: 20 });
  const otpauthUrl = `otpauth://totp/MyApp?secret=${secret.base32}&issuer=MyApp`;

  try {
    // Gera a URL do QR code a partir do otpauthUrl
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return NextResponse.json({ secret: secret.base32, qrCodeDataUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}