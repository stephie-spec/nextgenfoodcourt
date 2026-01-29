import "@/styles/globals.css";

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
}
