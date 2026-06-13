/**
 * Patreon donor data, fetched from the Patreon v2 API.
 *
 * Requires a creator access token. Set these in the environment:
 *   PATREON_ACCESS_TOKEN  — creator's access token (Patreon dev portal → your client)
 *   PATREON_CAMPAIGN_ID   — optional; resolved from the token's first campaign if omitted
 *
 * Without a token the page degrades gracefully to an empty state, so the build
 * never fails and the page renders before any Patreon setup is done.
 */

const API = "https://www.patreon.com/api/oauth2/v2";

export type Donor = {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** Lifetime support in cents — used only for ordering. */
  lifetimeCents: number;
};

type ApiUser = {
  id: string;
  type: "user";
  attributes: { full_name?: string; image_url?: string | null };
};

type ApiMember = {
  id: string;
  type: "member";
  attributes: {
    full_name?: string;
    patron_status?: string | null;
    lifetime_support_cents?: number;
  };
  relationships?: { user?: { data?: { id: string } } };
};

type MembersResponse = {
  data?: ApiMember[];
  included?: ApiUser[];
  links?: { next?: string };
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "User-Agent": "zelto-fonts" };
}

/** Resolve the campaign id from the token if PATREON_CAMPAIGN_ID is unset. */
async function resolveCampaignId(token: string): Promise<string | null> {
  const res = await fetch(`${API}/campaigns`, {
    headers: authHeaders(token),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: Array<{ id: string }> };
  return json.data?.[0]?.id ?? null;
}

/**
 * Active patrons for the configured campaign, ordered by lifetime support.
 * Returns an empty array when Patreon is not configured or the API errors —
 * callers should render an empty state, not assume a failure.
 */
export async function getDonors(): Promise<Donor[]> {
  const token = process.env.PATREON_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const campaignId =
      process.env.PATREON_CAMPAIGN_ID || (await resolveCampaignId(token));
    if (!campaignId) return [];

    const params = new URLSearchParams({
      include: "user",
      "fields[member]": "full_name,patron_status,lifetime_support_cents",
      "fields[user]": "full_name,image_url",
      "page[size]": "100",
    });

    const donors: Donor[] = [];
    let url: string | null =
      `${API}/campaigns/${campaignId}/members?${params.toString()}`;

    // Follow pagination so large campaigns list every patron.
    while (url) {
      const res: Response = await fetch(url, {
        headers: authHeaders(token),
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;

      const json = (await res.json()) as MembersResponse;
      const users = new Map(
        (json.included ?? []).map((u) => [u.id, u.attributes]),
      );

      for (const member of json.data ?? []) {
        if (member.attributes.patron_status !== "active_patron") continue;
        const userId = member.relationships?.user?.data?.id;
        const user = userId ? users.get(userId) : undefined;
        const name = user?.full_name || member.attributes.full_name || "Anonymous";
        donors.push({
          id: member.id,
          name,
          avatarUrl: user?.image_url ?? null,
          lifetimeCents: member.attributes.lifetime_support_cents ?? 0,
        });
      }

      url = json.links?.next ?? null;
    }

    return donors.sort((a, b) => b.lifetimeCents - a.lifetimeCents);
  } catch {
    return [];
  }
}
