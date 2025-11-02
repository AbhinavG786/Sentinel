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

export async function sanitizeIncidentData(
  db: Knex,
  incident: any,
  userId?: string
) {
  let sanitized = JSON.parse(JSON.stringify(incident));
  let dataString = JSON.stringify(sanitized);
  const triggeredPolicies: any[] = [];

  for (const { regex, replace } of staticPatterns) {
    dataString = dataString.replace(regex, replace);
  }

  // STEP 2️⃣ — Load active knowledge policies
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
          // optional: record violation for disallowed domain usage
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
      // Record event in system_events
      await db("system_events").insert({
        event_type: "POLICY_TRIGGERED",
        source: "firewall_sanitization",
        payload: JSON.stringify({
          policy_id: policy.id,
          incident_id: incident.id,
          user_id: userId || null,
        }),
      });

      // Record detailed policy log
      await db("policy_logs").insert({
        user_id: userId || null,
        incident_id: incident.id,
        policy_id: policy.id,
        detected_violation: triggeredPolicies.map((p) => p.keyword).join(", "),
        ai_response_snippet: dataString.slice(0, 500),
        action_taken: "redacted",
      });

      // Create alert (optional)
      await db("alerts").insert({
        incident_id: incident.id,
        triggered_by: userId || null,
        message: `Policy "${policy.name}" triggered on incident ${incident.id}`,
        severity: "medium",
      });
    }
  }

  return JSON.parse(dataString);
}
