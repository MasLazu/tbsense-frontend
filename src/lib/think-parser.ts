/**
 * Extracts the content of a single <think>...</think> block from plain text.
 * Handles three cases:
 * - no <think> tag present -> returns null
 * - a closed <think>...</think> -> returns the inner content
 * - an open trailing <think> without a closing tag -> returns the remainder after the opening tag
 */
export function extractThinkContent(text: string): string | null {
  if (!text) return null;
  const re = /<think\b[^>]*>([\s\S]*?)(?:<\/think>|$)/i;
  const m = text.match(re);
  if (!m) return null;
  return m[1] ?? null;
}

// convenience: trimmed result
export function extractThinkContentTrimmed(text: string): string | null {
  const v = extractThinkContent(text);
  return v == null ? null : v.trim();
}

export default extractThinkContent;

/**
 * Remove only the inner text inside the first <think>...</think> (or trailing open <think>),
 * but keep the <think> tags themselves.
 * Examples:
 *  'a<think>hello</think>b' -> 'a<think></think>b'
 *  'a<think>incomplete' -> 'a<think>'
 */
export function removeThinkInner(text: string): string {
  if (!text) return text;
  // replace inner content for the first occurrence
  return text.replace(
    /(<think\b[^>]*>)[\s\S]*?(?:<\/think>|$)/i,
    (_m, open) => `${open}${""}${mEndsWithClose(_m) ? "</think>" : ""}`
  );
}

function mEndsWithClose(match: string): boolean {
  return /<\/think>\s*$/i.test(match);
}

/**
 * Remove the entire first <think>...</think> block (tags + content). If there's an open
 * trailing <think> with no closer, remove from the opening tag to the end of string.
 * Examples:
 *  'a<think>hello</think>b' -> 'ab'
 *  'a<think>incomplete' -> 'a'
 */
export function removeThinkBlock(text: string): string | null {
  if (!text) return null;
  const replaced = text
    .replace(/<think\b[^>]*>[\s\S]*?(?:<\/think>|$)/i, "")
    .trim();
  return replaced.length === 0 ? null : replaced;
}
