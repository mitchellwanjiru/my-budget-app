import { ParsedMessageResult, CategorizationRule, Category } from '../types';
import { parseMpesaMessage } from '../parser/mpesaParser';

// Cache processed hashes to avoid re-triggering the pop-up on the same copied SMS
const processedSignatures = new Set<string>();

export async function checkClipboardForMpesa(
  rules: CategorizationRule[],
  categories: Category[]
): Promise<ParsedMessageResult | null> {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    return null;
  }

  try {
    const text = await navigator.clipboard.readText();
    if (!text || text.trim().length < 20) return null;

    const trimmed = text.trim();
    // Quick heuristic: Does it mention M-PESA, Confirmed, Ksh, or KES?
    const looksLikeMpesa = /(?:M-PESA|Confirmed|Ksh|KES|bought.*airtime)/i.test(trimmed);
    if (!looksLikeMpesa) return null;

    // Check if already processed
    const signature = trimmed.slice(0, 40);
    if (processedSignatures.has(signature)) {
      return null;
    }

    const parsed = parseMpesaMessage(trimmed, rules, categories);
    if (parsed.isValid && parsed.amount > 0) {
      processedSignatures.add(signature);
      return parsed;
    }

    return null;
  } catch (err) {
    // Clipboard permission might not be granted by the browser yet
    return null;
  }
}

export function markAsProcessed(text: string) {
  if (!text) return;
  processedSignatures.add(text.trim().slice(0, 40));
}
