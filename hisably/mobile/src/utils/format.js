// Shared formatting helpers. Indian number system used across the app's
// Annual ITC Report so amount formatting lives in exactly one place.

// Group an integer with the Indian thousands/lakhs convention: 1687 -> "1,687",
// 123456 -> "1,23,456".
const indianGroup = (n) => {
  const sign = n < 0 ? '-' : '';
  const s = String(Math.abs(n));
  if (s.length <= 3) return sign + s;
  const head = s.slice(0, -3);
  const tail = s.slice(-3);
  const parts = [];
  let rest = head;
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return sign + parts.join(',') + ',' + tail;
};

/**
 * Format a rupee amount in the Indian number system:
 *   < 1,000            -> ₹940
 *   1,000 – 99,999     -> ₹1,687
 *   1,00,000 – <1Cr    -> ₹4.2L
 *   >= 1,00,00,000     -> ₹1.2Cr
 */
export const formatINR = (value) => {
  const v = Number(value || 0);
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  return `₹${indianGroup(Math.round(v))}`;
};

// FY label for a starting calendar year: 2024 -> "FY 2024-25".
export const fyLabel = (fy) => `FY ${fy}`;

/**
 * The last 3 Indian financial years as "2024-25" strings, oldest first.
 * Indian FY runs April–March: Jan–Mar belongs to the FY that started the
 * previous April.
 */
export const getFinancialYears = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const startYear = month >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  const years = [];
  for (let i = 2; i >= 0; i--) {
    const s = startYear - i;
    years.push(`${s}-${String((s + 1) % 100).padStart(2, '0')}`);
  }
  return years;
};

// The current financial year as a "2024-25" string.
export const currentFinancialYear = () => {
  const years = getFinancialYears();
  return years[years.length - 1];
};
