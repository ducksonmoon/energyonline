const FA_DIGITS: Record<string, string> = {
  "0": "۰",
  "1": "۱",
  "2": "۲",
  "3": "۳",
  "4": "۴",
  "5": "۵",
  "6": "۶",
  "7": "۷",
  "8": "۸",
  "9": "۹",
};

export function toFa(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => FA_DIGITS[d]);
}

export function formatToman(n: number): string {
  return `${toFa(Number(n).toLocaleString("en-US"))} تومان`;
}
