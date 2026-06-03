import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Site Unavailable — HourQuest",
  description: "HourQuest is temporarily unavailable.",
  path: "/shutdown",
  noIndex: true,
});

export default function ShutdownPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-page px-6 py-16 text-center">
      <div className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-caption">
          HourQuest
        </p>
        <h1 className="mt-3 font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-text sm:text-[2rem]">
          This website has been temporarily shut down
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          HourQuest is unavailable while we make updates. Please check back
          soon.
        </p>
      </div>
    </div>
  );
}
