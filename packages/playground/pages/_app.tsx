import { AppProps } from "next/dist/next-server/lib/router/router";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }: AppProps): any {
  return <Component {...pageProps} />;
}

export default MyApp;
