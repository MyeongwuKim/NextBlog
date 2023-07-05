import "@/styles/globals.css";
import "@/styles/preview.css";
import "@/styles/codemirror.css";
import "@/styles/loading.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import Layout from "@/components/layout";
import { SWRConfig } from "swr";

function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider attribute="class">
        <Layout>
          <SWRConfig
            value={{
              fetcher: (url: string) =>
                fetch(url).then((response) => response.json()),
            }}
          >
            <Component {...pageProps}></Component>
          </SWRConfig>
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default App;
