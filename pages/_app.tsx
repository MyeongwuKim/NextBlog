import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";

const darkTheme = {
  color: "white",
  bgColor: "rgb(50,50,50)",
  containerColor: "rgb(30,30,30)",
  textAlign: "flex-end",
};

const lightTheme = {
  color: "black",
  containerColor: "rgb(220,220,220)",
  textAlign: "flex-start",
  bgColor: "white",
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <div className="absolute w-full h-full min-w-[640px] bg-white text-slate-800 dark:bg-black dark:text-gray-200">
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}
