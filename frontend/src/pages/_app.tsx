import type { AppProps } from "next/app";
import { useEffect } from "react";
import { WristbandAuthProvider } from "@wristband/react-client-auth";
import { injectTheme } from "@/utils/theme";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Inject theme CSS variables on mount
    injectTheme();
  }, []);

  return (
    /* WRISTBAND_TOUCHPOINT - AUTHENTICATION */
    <WristbandAuthProvider
      loginUrl={'api/auth/login'}
      logoutUrl={'api/auth/logout'}
      sessionUrl={'api/session'}
      disableRedirectOnUnauthenticated={true} // Prevents automatic redirects when not authenticated
    >
      <Component {...pageProps} />
    </WristbandAuthProvider>
  )
}
