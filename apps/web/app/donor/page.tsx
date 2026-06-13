import type { Metadata } from "next";
import { PatreonIcon } from "@/components/icons/patreon";
import { GradientHeartIcon } from "@/components/icons/heart";
import { MotionA, Reveal, pressable } from "@/components/motion-primitives";
import { getDonors } from "@/lib/patreon";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Donors",
  description: "The people funding Zelto on Patreon. Join them.",
};

/** Initials fallback when a patron has no Patreon avatar. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function DonorPage() {
  const donors = await getDonors();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Donors
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-foreground">
            People who keep Zelto going<span className="text-brand">.</span>
          </h1>
        </div>

        <MotionA
          href={siteConfig.patreon}
          target="_blank"
          rel="noreferrer"
          {...pressable}
          className="inline-flex h-10 shrink-0 items-center gap-2 bg-[#ff424d] px-4 font-medium text-white"
        >
          <PatreonIcon className="size-4" />
          <span className="hidden sm:inline">Support me</span>
        </MotionA>
      </div>

      <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
        Zelto is free and community-curated. If it saves you time, you can fund the
        work on Patreon — every supporter is credited right here.
      </p>

      <h2 className="mt-14 text-xl font-semibold tracking-tight text-foreground">
        {donors.length > 0
          ? `${donors.length} ${donors.length === 1 ? "supporter" : "supporters"}`
          : "Supporters"}
      </h2>

      {donors.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {donors.map((donor, i) => (
            <Reveal
              as="li"
              key={donor.id}
              delay={Math.min(i, 8) * 0.04}
              className="flex items-center gap-3 border border-border bg-card p-4 shadow-card"
            >
              {donor.avatarUrl ? (
                // Plain img: Patreon CDN hosts avatars; avoids next/image remote config.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={donor.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs text-muted-foreground">
                  {initials(donor.name)}
                </span>
              )}
              <span className="truncate font-medium text-foreground">{donor.name}</span>
            </Reveal>
          ))}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-5 border border-dashed border-border bg-card px-6 py-16 text-center">
          <GradientHeartIcon className="size-8" />
          <p className="text-muted-foreground">No supporters yet — be the first to chip in.</p>
          <MotionA
            href={siteConfig.patreon}
            target="_blank"
            rel="noreferrer"
            {...pressable}
            className="inline-flex h-11 items-center gap-2.5 bg-[#ff424d] px-6 font-medium text-white"
          >
            <PatreonIcon className="size-4" />
            Be the first
          </MotionA>
        </div>
      )}
    </div>
  );
}
