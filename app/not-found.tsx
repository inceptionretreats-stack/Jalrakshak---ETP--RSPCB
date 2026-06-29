import Link from "next/link";
import { Home, Waves } from "lucide-react";
import { JalRakshakLogo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-teal-50/50 to-cyan-50 px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(13,148,136,0.12),transparent)]" />
      <div className="relative z-10 flex flex-col items-center">
        <JalRakshakLogo size={44} />
        <div className="mt-10 flex items-center gap-3 text-primary">
          <Waves className="h-8 w-8" />
          <span className="font-display text-7xl font-extrabold tracking-tight text-gradient-brand">404</span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">This channel ran dry</h1>
        <p className="mt-2 max-w-md text-slate-600">
          The page you are looking for could not be found. It may have been moved, or the link is incorrect.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild className="h-11 gap-2 rounded-full px-6">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full px-6">
            <Link href="/login">Enter platform</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
