/**
 * Google Vision API integration for content moderation.
 * Gracefully degrades if credentials are not configured.
 */

export async function moderateContent(
  imageBase64: string
): Promise<{ safe: boolean; reason?: string }> {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) {
    // No credentials configured — skip moderation in dev
    console.warn(
      "[Moderation] GOOGLE_APPLICATION_CREDENTIALS not set. Skipping moderation."
    );
    return { safe: true };
  }

  try {
    const { ImageAnnotatorClient } = await import("@google-cloud/vision");
    const client = new ImageAnnotatorClient();

    const [result] = await client.safeSearchDetection({
      image: { content: imageBase64 },
    });

    const safe = result.safeSearchAnnotation;
    if (!safe) return { safe: true };

    const blocked = ["VERY_LIKELY", "LIKELY"];
    const adult = typeof safe.adult === "string" ? safe.adult : String(safe.adult ?? "");
    const violence = typeof safe.violence === "string" ? safe.violence : String(safe.violence ?? "");
    const racy = typeof safe.racy === "string" ? safe.racy : String(safe.racy ?? "");

    if (blocked.includes(adult)) {
      return { safe: false, reason: "Adult content detected" };
    }
    if (blocked.includes(violence)) {
      return { safe: false, reason: "Violent content detected" };
    }
    if (blocked.includes(racy)) {
      return { safe: false, reason: "Racy content detected" };
    }

    return { safe: true };
  } catch (err) {
    console.error("[Moderation] Vision API error:", err);
    // On error, allow upload to proceed (fail-open policy for availability)
    return { safe: true };
  }
}
