import { getCollection, sanitizeDocument } from "@/lib/db";
import { staticProfile, ProfileData } from "@/features/profile/data";
import { ProfileDocument } from "@/features/profile/schema";

/**
 * Retrieves the profile information for the portfolio.
 * Falls back to static profile data if database is unreachable.
 */
export async function getProfile(): Promise<ProfileData> {
  try {
    const collection = await getCollection("profile");
    const doc = await collection.findOne({});

    if (doc) {
      const sanitized = sanitizeDocument<ProfileDocument>(doc);
      if (sanitized) {
        return {
          name: sanitized.name,
          headline: sanitized.headline,
          subheadline: sanitized.subheadline,
          bio: sanitized.bio,
          location: sanitized.location,
          timezone: sanitized.timezone,
          availability: sanitized.availability,
          email: sanitized.email,
          phone: sanitized.phone,
          socials: sanitized.socials,
          resume: sanitized.resume,
          now: sanitized.now,
          toolbox: sanitized.toolbox,
          photos: sanitized.photos || staticProfile.photos,
          activePhotoId: sanitized.activePhotoId || sanitized.photos?.[0]?.publicId || staticProfile.activePhotoId,
        };
      }
    }
  } catch (err) {
    console.warn(
      "⚠️ [DB] Unable to reach MongoDB for getProfile, falling back to static profile:",
      err instanceof Error ? err.message : err,
    );
  }

  return staticProfile;
}

/**
 * Retrieves the current "Now" section status.
 */
export async function getNow(): Promise<ProfileData["now"]> {
  const profile = await getProfile();
  return profile.now;
}

/**
 * Retrieves the active profile photo or fallback.
 */
export async function getActivePhoto(): Promise<{ publicId: string; alt: string }> {
  const profile = await getProfile();
  const active = profile.photos?.find((p) => p.publicId === profile.activePhotoId) || profile.photos?.[0];
  if (active) {
    return { publicId: active.publicId, alt: active.alt };
  }
  const defaultPhoto = staticProfile.photos[0] || {
    publicId: "devden/portraits/default",
    alt: "Asfakul portrait",
  };

  return {
    publicId: defaultPhoto.publicId,
    alt: defaultPhoto.alt,
  };
}
