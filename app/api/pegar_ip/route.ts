import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'IP não disponível';
    const userAgent = request.headers.get('user-agent') || 'Navegador não disponível';

    const apiToken = '581d67be614e2f';  // Use seu token aqui
    const apiUrl = `https://ipinfo.io/${ip}?token=${apiToken}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status === 429) {
                console.error('Quota exceeded');
            } else if (response.status === 403) {
                console.error('Access denied - Invalid token or not allowed');
            } else if (response.status === 101) {
                console.error('Invalid API key or missing');
            } else if (response.status === 104) {
                console.error('Quota exceeded');
            } else {
                console.error(`Error: ${response.statusText}`);
            }
            return NextResponse.json({ ip, userAgent, error: 'Error fetching geolocation data' });
        }

        const data = await response.json();
        const { city, region, country } = data;

        return NextResponse.json({ ip, userAgent, city, region, country });

    } catch (error) {
        console.error('Error fetching geolocation:', error);
        return NextResponse.json({ ip, userAgent, error: 'Failed to fetch geolocation data' });
    }
}

