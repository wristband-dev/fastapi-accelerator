import { useWristbandAuth } from "@wristband/react-client-auth";
import { geistMono, geistSans } from "@/utils/fonts";
import Hero from "@/components/Hero";
import Home from "@/components/Content/Home";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useWristbandAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Hero for unauthenticated users, Home for authenticated users
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)]`}>
      {isAuthenticated ? <Home /> : <Hero />}
    </div>
  );
}
