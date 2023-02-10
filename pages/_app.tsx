import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <div className="w-full h-full absolute text-slate-800 bg-white dark:bg-black dark:text-gray-200">
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}
