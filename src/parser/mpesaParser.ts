import { ParsedMessageResult, TransactionType, CategorizationRule, Category } from '../types';

/**
 * Normalizes numbers with commas and currency prefixes
 * e.g., "Ksh1,250.00" -> 1250.00
 */
export function extractAmount(text: string): number | null {
  // Must match explicit currency prefix (Ksh, KES, KSH, $, EUR, GBP) so it doesn't match random letters/numbers
  const match = text.match(/(?:Ksh|KES|KSH|\$|EUR|GBP)\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
  if (!match) return null;
  const cleaned = match[1].replace(/,/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

/**
 * Parses date string in DD/MM/YY or DD/MM/YYYY into YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  // Try DD/MM/YY or DD/MM/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    let year = slashMatch[3];
    if (year.length === 2) {
      year = '20' + year;
    }
    return `${year}-${month}-${day}`;
  }

  // Try YYYY-MM-DD
  const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoMatch) return dateStr;

  // Fallback to current date
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Normalizes time string e.g. "2:30 PM" to "14:30"
 */
export function normalizeTime(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr.trim();

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Categorize party/text based on active rules and categories
 */
export function categorizeTransaction(
  party: string,
  rawMessage: string,
  type: TransactionType,
  rules: CategorizationRule[],
  categories: Category[]
): { categoryId: string; confidence: number } {
  const upperParty = (party || '').toUpperCase();
  const upperRaw = (rawMessage || '').toUpperCase();

  // If income type and party indicates received/salary
  if (type === 'income') {
    const incomeCat = categories.find(c => c.type === 'income');
    return { categoryId: incomeCat?.id || 'cat_income', confidence: 0.9 };
  }

  // Check matching rules
  for (const rule of rules) {
    const targetText = rule.matchField === 'party' ? upperParty : upperRaw;
    if (targetText.includes(rule.keyword.toUpperCase())) {
      return { categoryId: rule.categoryId, confidence: 0.95 };
    }
  }

  // Fallback checks based on keywords in party
  if (upperParty.includes('SUPERMARKET') || upperParty.includes('MART') || upperParty.includes('GROCER')) {
    return { categoryId: 'cat_groceries', confidence: 0.85 };
  }
  if (upperParty.includes('RESTAURANT') || upperParty.includes('CAFE') || upperParty.includes('PIZZA') || upperParty.includes('HOTEL')) {
    return { categoryId: 'cat_dining', confidence: 0.85 };
  }
  if (upperParty.includes('POWER') || upperParty.includes('WATER') || upperParty.includes('STIMA') || upperParty.includes('KPLC')) {
    return { categoryId: 'cat_utilities', confidence: 0.9 };
  }
  if (upperParty.includes('PETROL') || upperParty.includes('SHELL') || upperParty.includes('TOTAL') || upperParty.includes('CAB') || upperParty.includes('RIDE')) {
    return { categoryId: 'cat_transport', confidence: 0.85 };
  }
  if (upperRaw.includes('AIRTIME') || upperParty.includes('AIRTIME')) {
    return { categoryId: 'cat_airtime', confidence: 0.95 };
  }

  // Default fallback
  return { categoryId: 'cat_general', confidence: 0.5 };
}

/**
 * Main M-Pesa SMS Parser
 */
export function parseMpesaMessage(
  rawText: string,
  rules: CategorizationRule[],
  categories: Category[]
): ParsedMessageResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawMessage: rawText,
      confidence: 0,
      currency: 'Ksh',
      amount: 0,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      party: 'Unknown',
      suggestedCategoryId: 'cat_general',
      error: 'Empty message'
    };
  }

  // 1. Extract transaction code (e.g. "QA12BC34DE Confirmed." or "RC98LK54GH confirmed")
  const codeMatch = trimmed.match(/^([A-Z0-9]{8,12})\s+(?:Confirmed|confirmed)\./i);
  const code = codeMatch ? codeMatch[1].toUpperCase() : undefined;

  // 2. Extract transaction fee / cost
  let fee: number | undefined = undefined;
  const feeMatch = trimmed.match(/Transaction cost,?\s*(?:Ksh|KES)?\s*([0-9,.]+)/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(/,/g, ''));
  }

  // 3. Extract balance after
  let balanceAfter: number | undefined = undefined;
  const balanceMatch = trimmed.match(/New\s+M-PESA\s+balance\s+is\s+(?:Ksh|KES)?\s*([0-9,.]+)/i);
  if (balanceMatch) {
    balanceAfter = parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  // 4. Extract date and time
  let date = new Date().toISOString().split('T')[0];
  let time = '12:00';
  const dateTimeMatch = trimmed.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (dateTimeMatch) {
    date = normalizeDate(dateTimeMatch[1]);
    time = normalizeTime(dateTimeMatch[2]);
  }

  // 5. Detect Transaction Pattern:
  // Pattern A: "paid to <MERCHANT>." (Buy Goods / Till)
  const paidToMatch = trimmed.match(/(?:Ksh|KES)\s*([0-9,.]+)\s+paid\s+to\s+([^.]+?)(?:\.\s+on|\s+on|\.\s+New|\s+New)/i);
  if (paidToMatch) {
    const amount = parseFloat(paidToMatch[1].replace(/,/g, ''));
    const party = paidToMatch[2].trim().replace(/\.$/, '');
    const { categoryId, confidence } = categorizeTransaction(party, trimmed, 'expense', rules, categories);

    return {
      isValid: true,
      code,
      type: 'expense',
      amount,
      fee: fee ?? 0,
      currency: 'Ksh',
      date,
      time,
      party,
      balanceAfter,
      suggestedCategoryId: categoryId,
      confidence,
      rawMessage: trimmed
    };
  }

  // Pattern B: "sent to <NAME/ACCOUNT> for account <ACC>" (Paybill)
  const paybillMatch = trimmed.match(/(?:Ksh|KES)\s*([0-9,.]+)\s+sent\s+to\s+(.+?)\s+for\s+account\s+([A-Za-z0-9_-]+)\s+on/i);
  if (paybillMatch) {
    const amount = parseFloat(paybillMatch[1].replace(/,/g, ''));
    const party = paybillMatch[2].trim();
    const accountNumber = paybillMatch[3].trim();
    const { categoryId, confidence } = categorizeTransaction(party, trimmed, 'expense', rules, categories);

    return {
      isValid: true,
      code,
      type: 'expense',
      amount,
      fee: fee ?? 0,
      currency: 'Ksh',
      date,
      time,
      party: `${party} (Acc: ${accountNumber})`,
      accountNumber,
      balanceAfter,
      suggestedCategoryId: categoryId,
      confidence,
      rawMessage: trimmed
    };
  }

  // Pattern C: "sent to <NAME> [<PHONE>] on <DATE>" (Send Money P2P)
  const sentToPersonMatch = trimmed.match(/(?:Ksh|KES)\s*([0-9,.]+)\s+sent\s+to\s+([A-Za-z0-9\s]+?)(?:\s+((?:\+?254|0)[0-9]{8,10}))?\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (sentToPersonMatch) {
    const amount = parseFloat(sentToPersonMatch[1].replace(/,/g, ''));
    const name = sentToPersonMatch[2].replace(/\s+/g, ' ').trim();
    const phone = sentToPersonMatch[3]?.trim();
    const { categoryId, confidence } = categorizeTransaction(name, trimmed, 'expense', rules, categories);

    return {
      isValid: true,
      code,
      type: 'expense',
      amount,
      fee: fee ?? 0,
      currency: 'Ksh',
      date: normalizeDate(sentToPersonMatch[4]),
      time,
      party: name,
      accountNumber: phone,
      balanceAfter,
      // Default sent to person is Family & Transfers unless specific rule matches
      suggestedCategoryId: categoryId === 'cat_general' ? 'cat_family' : categoryId,
      confidence,
      rawMessage: trimmed
    };
  }

  // Pattern D: "You have received <AMOUNT> from <NAME> <PHONE>" (Received Money)
  const receivedMatch = trimmed.match(/received\s+(?:Ksh|KES)\s*([0-9,.]+)\s+from\s+([A-Za-z0-9\s]+?)(?:\s+((?:\+?254|0)[0-9]{8,10}))?\s+on/i);
  if (receivedMatch) {
    const amount = parseFloat(receivedMatch[1].replace(/,/g, ''));
    const party = receivedMatch[2].trim();
    const phone = receivedMatch[3]?.trim();

    return {
      isValid: true,
      code,
      type: 'income',
      amount,
      fee: 0,
      currency: 'Ksh',
      date,
      time,
      party: party || 'M-Pesa Sender',
      accountNumber: phone,
      balanceAfter,
      suggestedCategoryId: 'cat_income',
      confidence: 0.95,
      rawMessage: trimmed
    };
  }

  // Pattern E: "You bought <AMOUNT> of airtime" (Airtime)
  const airtimeMatch = trimmed.match(/bought\s+(?:Ksh|KES)\s*([0-9,.]+)\s+of\s+airtime/i);
  if (airtimeMatch) {
    const amount = parseFloat(airtimeMatch[1].replace(/,/g, ''));
    return {
      isValid: true,
      code,
      type: 'expense',
      amount,
      fee: fee ?? 0,
      currency: 'Ksh',
      date,
      time,
      party: 'Safaricom Airtime',
      balanceAfter,
      suggestedCategoryId: 'cat_airtime',
      confidence: 0.99,
      rawMessage: trimmed
    };
  }

  // Pattern F: "Withdraw <AMOUNT> from <AGENT>" (Agent Withdrawal)
  const withdrawMatch = trimmed.match(/Withdraw\s+(?:Ksh|KES)\s*([0-9,.]+)\s+from\s+([^.]+?)(?:\.\s+on|\s+on|\.\s+New|\s+New)/i);
  if (withdrawMatch) {
    const amount = parseFloat(withdrawMatch[1].replace(/,/g, ''));
    const agent = withdrawMatch[2].trim();
    return {
      isValid: true,
      code,
      type: 'transfer',
      amount,
      fee: fee ?? 0,
      currency: 'Ksh',
      date,
      time,
      party: `Cash Withdrawal (${agent})`,
      balanceAfter,
      suggestedCategoryId: 'cat_general',
      confidence: 0.85,
      rawMessage: trimmed
    };
  }

  // Pattern G: Fallback generic parser for other bank SMS or non-standard M-Pesa format
  const genericAmount = extractAmount(trimmed);
  if (genericAmount && genericAmount > 0) {
    const isIncome = /received|credited|deposit|salary/i.test(trimmed);
    return {
      isValid: true,
      code,
      type: isIncome ? 'income' : 'expense',
      amount: genericAmount,
      fee: fee ?? 0,
      currency: 'Ksh',
      date,
      time,
      party: 'Transaction',
      balanceAfter,
      suggestedCategoryId: isIncome ? 'cat_income' : 'cat_general',
      confidence: 0.5,
      rawMessage: trimmed
    };
  }

  return {
    isValid: false,
    rawMessage: trimmed,
    confidence: 0,
    currency: 'Ksh',
    amount: 0,
    type: 'expense',
    date,
    party: 'Unrecognized Message',
    suggestedCategoryId: 'cat_general',
    error: 'Could not detect transaction amount or details'
  };
}

/**
 * Batch parses multiple SMS messages separated by blank lines or multiple paragraphs
 */
export function parseBatchMessages(
  bulkText: string,
  rules: CategorizationRule[],
  categories: Category[]
): ParsedMessageResult[] {
  // Split on double line breaks, or lines that begin with transaction codes
  // Many users paste multiple SMS texts back-to-back
  const chunks = bulkText
    .split(/(?:\r?\n\s*\r?\n)|(?=(?:[A-Z0-9]{8,12}\s+(?:Confirmed|confirmed)\.))/i)
    .map(c => c.trim())
    .filter(c => c.length > 15);

  const results: ParsedMessageResult[] = [];
  const seenCodes = new Set<string>();

  for (const chunk of chunks) {
    const parsed = parseMpesaMessage(chunk, rules, categories);
    // Deduplicate identical codes in the same batch
    if (parsed.code && seenCodes.has(parsed.code)) {
      continue;
    }
    if (parsed.code) {
      seenCodes.add(parsed.code);
    }
    results.push(parsed);
  }

  return results;
}
