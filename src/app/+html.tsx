import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0B4A37" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
        />
        <ScrollViewStyleReset />
        {/* Aplica o tema salvo antes do primeiro desenho, evitando o clarão ao recarregar no modo escuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('conformia_tema')==='escuro'){document.documentElement.dataset.tema='escuro';document.documentElement.style.colorScheme='dark'}}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
