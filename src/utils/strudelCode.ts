/**
 * Extracts Strudel code from user input.
 * Accepts either raw Strudel code or a strudel.cc / strudel.tidalcycles.org URL.
 * For URLs, the code is base64-encoded in the hash fragment.
 */
export function extractStrudelCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const isUrl =
    trimmed.includes('strudel.cc') || trimmed.includes('strudel.tidalcycles.org');

  if (isUrl) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const hash = url.hash;
      if (!hash || hash.length <= 1) return null;
      const encoded = hash.slice(1);
      const decodedUrl = decodeURIComponent(encoded);
      return atob(decodedUrl);
    } catch {
      return null;
    }
  }

  return trimmed;
}

export interface StrudelMetadata {
  title?: string;
  by?: string;
}

/**
 * Parses Strudel metadata from code comments.
 * Looks for: // @title <title> @by <author>
 */
export function parseMetadataFromCode(code: string): StrudelMetadata {
  const metadata: StrudelMetadata = {};
  const firstLines = code.split('\n').slice(0, 3).join('\n');

  const titleMatch = firstLines.match(/@title\s+(.+?)(?=\s+@by\s|$|\n)/s);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  const byMatch = firstLines.match(/@by\s+(.+?)(?=$|\n)/s);
  if (byMatch) {
    metadata.by = byMatch[1].trim();
  }

  return metadata;
}
