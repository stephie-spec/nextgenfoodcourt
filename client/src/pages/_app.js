import 'bootstrap/dist/css/bootstrap.min.css';
import "@/styles/globals.css";

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
      <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}
