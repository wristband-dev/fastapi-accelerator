import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/wristband_icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/wristband_icon.svg" />
        <link rel="apple-touch-icon" href="/wristband_icon.svg" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
