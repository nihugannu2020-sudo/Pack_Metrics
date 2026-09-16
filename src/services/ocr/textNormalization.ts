export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeOCRText(value: string): string {
  return value
    .replace(/Manufacturedby/gi, 'Manufactured by')
    .replace(/Manufactur(ed|ing)\s*by/gi, 'Manufactured by')
    .replace(/Manufactured\s+by/gi, 'Manufactured by')
    .replace(/Manufactured[-\s]+by/gi, 'Manufactured by')
    .replace(/Mfd\s*by/gi, 'Mfd by')
    .replace(/Mfd\.?\s*by/gi, 'Mfd by')
    .replace(/Packagedby/gi, 'Packaged by')
    .replace(/Packedby/gi, 'Packed by')
    .replace(/Importedby/gi, 'Imported by')
    .replace(/Imported,\s*Marketed\s*&\s*Customer\s*Care\s*by/gi, 'Imported, Marketed & Customer Care by')
    .replace(/Imported,\s*Marketed\s*&\s*CustomerCare\s*by/gi, 'Imported, Marketed & Customer Care by')
    .replace(/CustomerCare/gi, 'Customer Care')
    .replace(/ConsumerCare/gi, 'Consumer Care')
    .replace(/Maximum\s+Retail\s+Price/gi, 'Maximum Retail Price')
    .replace(/M\.R\.P\./gi, 'M.R.P.')
    .replace(/M R P/gi, 'M.R.P.')
    .replace(/\s+,/g, ',')
    .replace(/\s+:/g, ':')
    .replace(/\s+-\s+/g, ' - ')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function normalizeCurrencyValue(value: string): string {
  const cleaned = value
    .replace(/[^0-9,\.\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/,(?=\d{3}(?:\D|$))/g, '');

  if (!cleaned) return value;
  return cleaned;
}

export function normalizeMonthYear(value: string): string {
  return value
    .replace(/\bJanuary\b/gi, 'January')
    .replace(/\bFebruary\b/gi, 'February')
    .replace(/\bMarch\b/gi, 'March')
    .replace(/\bApril\b/gi, 'April')
    .replace(/\bMay\b/gi, 'May')
    .replace(/\bJune\b/gi, 'June')
    .replace(/\bJuly\b/gi, 'July')
    .replace(/\bAugust\b/gi, 'August')
    .replace(/\bSeptember\b/gi, 'September')
    .replace(/\bOctober\b/gi, 'October')
    .replace(/\bNovember\b/gi, 'November')
    .replace(/\bDecember\b/gi, 'December')
    .replace(/\bJan\b/gi, 'Jan')
    .replace(/\bFeb\b/gi, 'Feb')
    .replace(/\bMar\b/gi, 'Mar')
    .replace(/\bApr\b/gi, 'Apr')
    .replace(/\bJun\b/gi, 'Jun')
    .replace(/\bJul\b/gi, 'Jul')
    .replace(/\bAug\b/gi, 'Aug')
    .replace(/\bSep\b/gi, 'Sep')
    .replace(/\bOct\b/gi, 'Oct')
    .replace(/\bNov\b/gi, 'Nov')
    .replace(/\bDec\b/gi, 'Dec')
    .trim();
}

export function collapseOCRSpacing(value: string): string {
  return value.replace(/(?<=\d)\s+(?=\d)/g, '').replace(/\s{2,}/g, ' ').trim();
}
