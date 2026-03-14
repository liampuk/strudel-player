/**
 * Builds a share URL with the given Strudel code base64-encoded in the hash.
 * Same format as strudel.cc share links.
 */
export function getShareUrlForCode(code: string): string {
  const encoded = encodeURIComponent(btoa(code));
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
}

/**
 * Builds a share URL with the given track id in the hash.
 * Used for default playlist tracks.
 */
export function getShareUrlForTrackId(trackId: string): string {
  return `${window.location.origin}${window.location.pathname}#id=${encodeURIComponent(trackId)}`;
}

/**
 * Returns the track id from the URL hash if present.
 * Format: #id=track-id
 */
export function getTrackIdFromUrl(): string | null {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#id=')) return null;
  const id = hash.slice(4);
  return id ? decodeURIComponent(id) : null;
}

/**
 * Checks if the URL hash contains encoded Strudel code, strips URL encoding,
 * decodes from base64, and returns the Strudel code as a string.
 * Returns null if no encoded code is found in the URL.
 * Ignores #id= format (use getTrackIdFromUrl for that).
 */
export function getEncodedStrudelFromUrl(): string | null {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return null;

  // Ignore id= format
  if (hash.startsWith('#id=')) return null;

  // Remove leading # from hash
  const encoded = hash.slice(1);
  if (!encoded) return null;

  try {
    // Strip URL encoding (%2B -> +, %3D -> =, etc.)
    const decodedUrl = decodeURIComponent(encoded);

    // Decode base64 to string
    const strudelCode = atob(decodedUrl);
    return strudelCode;
  } catch {
    return null;
  }
}
