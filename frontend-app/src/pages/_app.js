// Gunakan alias @ untuk mengarah ke src/styles/globals.css
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}