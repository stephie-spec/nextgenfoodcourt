import "@/styles/globals.css";

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/lib/CartContext";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={pageProps.session}>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
