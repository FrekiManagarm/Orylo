import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-20 font-mono">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-indigo-500" />
              <span className="text-white font-bold text-lg tracking-tight">
                ORYLO_SYSTEMS
              </span>
            </div>
            <p className="text-zinc-600 text-xs max-w-xs uppercase leading-relaxed">
              Advanced transaction monitoring protocol. <br />
              Securing the payment infrastructure layer.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">
              Modules
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li>
                <Link
                  href="#features"
                  className="hover:text-indigo-400 transition-colors"
                >
                  [01] Features
                </Link>
              </li>
              <li>
                <Link
                  href="#roi"
                  className="hover:text-indigo-400 transition-colors"
                >
                  [02] Estimator
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-indigo-400 transition-colors"
                >
                  [03] Access
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">
              Protocol
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Privacy_Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Terms_of_Service
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="hover:text-indigo-400 transition-colors"
                >
                  System_Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-700">
          <div>
            © {new Date().getFullYear()} Orylo Inc. // All systems nominal.
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://twitter.com/orylo"
              className="hover:text-white transition-colors"
            >
              TWITTER
            </Link>
            <Link
              href="https://github.com/orylo"
              className="hover:text-white transition-colors"
            >
              GITHUB
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
