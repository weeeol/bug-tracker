import Link from "next/link";
import { StatePanel } from "@/components/state-panel";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <StatePanel title="Account creation is coming next">
        <p>
          The authentication flow is intentionally not connected in the shell
          task. Return to the sign-in preview to explore the public entry.
        </p>
        <Link
          className="mt-5 inline-block rounded-md bg-sky-400 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          href="/auth/sign-in"
        >
          Back to sign in
        </Link>
      </StatePanel>
    </div>
  );
}
