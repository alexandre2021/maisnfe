// app/layout.tsx

import './estilos/globals.css';

export const metadata = {
  title: 'Minha Aplicação',
  description: 'Descrição da minha aplicação',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}



