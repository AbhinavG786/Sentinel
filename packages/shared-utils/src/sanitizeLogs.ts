import { Knex } from "knex";

//  Basic static regexes
const staticPatterns = [
  {
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replace: "[REDACTED_EMAIL]",
  },
  { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replace: "[REDACTED_IP]" },
  {
    regex: /(?<=['"]?key['"]?\s*[:=]\s*['"]?)[a-zA-Z0-9-_]{16,}(?=['"]?)/gi,
    replace: "[REDACTED_API_KEY]",
  },
  {
    regex: /(?<=password\s*[:=]\s*['"]?)[^'"\s]+(?=['"]?)/gi,
    replace: "[REDACTED_PASSWORD]",
  },
  {
    regex: /(?<=token\s*[:=]\s*['"]?)[A-Za-z0-9-_]+(?=['"]?)/gi,
    replace: "[REDACTED_TOKEN]",
  },
];

export async function sanitizeLogs(
  db: Knex,
  logs: any,
  userId?: string,
  traceId?: string
) {
  let sanitized = JSON.parse(JSON.stringify(logs));
  let dataString = JSON.stringify(sanitized);
  const triggeredPolicies: any[] = [];

  for (const { regex, replace } of staticPatterns) {
    dataString = dataString.replace(regex, replace);
  }

  // STEP 2 — Load active knowledge policies
  const policies = await db("knowledge_policies").select("*");

  for (const policy of policies) {
    let matched = false;

    // Check blocked keywords
    if (policy.blocked_keywords?.length) {
      for (const keyword of policy.blocked_keywords) {
        const regex = new RegExp(keyword, "gi");
        if (regex.test(dataString)) {
          matched = true;
          triggeredPolicies.push({
            policy,
            keyword,
            action: "blocked",
          });
          dataString = dataString.replace(regex, "[REDACTED_POLICY]");
        }
      }
    }

    // Check allowed domains (optional, e.g., whitelist enforcement)
    if (policy.allowed_domains?.length) {
      for (const domain of policy.allowed_domains) {
        const domainRegex = new RegExp(domain.replace(/\./g, "\\."), "gi");
        if (!domainRegex.test(dataString)) {
          matched = true;
          triggeredPolicies.push({
            policy,
            keyword: domain,
            action: "warned",
          });
        }
      }
    }

    if (matched) {
      // Record event in system_events (traceId enables backfill of incident_id later)
      await db("system_events").insert({
        event_type: "POLICY_TRIGGERED",
        source: "firewall_sanitization",
        payload: JSON.stringify({
          policy_id: policy.id,
          user_id: userId || null,
          traceId: traceId || null,
          triggered_keywords: triggeredPolicies.map(p => p.keyword),
        }),
      });
    }
  }

  return {
    sanitizedData:dataString,
    triggeredPolicies
  };
}
