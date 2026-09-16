export type ParsedDate = { date: Date; source: string } | null;

const ISO_FULL = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;

export function parseDue(due: string | undefined): ParsedDate {
  const value = (due ?? "").trim();
  if (!value || /^tbd|unassigned|unknown|n\/?a$/i.test(value)) return null;

  const full = ISO_FULL.exec(value);
  if (full) {
    const [, y, m, d] = full.map(Number) as unknown as number[];
    const date = new Date(Date.UTC(y, m - 1, d));
    if (!Number.isNaN(date.getTime())) return { date, source: value };
  }

  const month = ISO_MONTH.exec(value);
  if (month) {
    const [, y, m] = month.map(Number) as unknown as number[];
    const date = new Date(Date.UTC(y, m - 1, 15));
    if (!Number.isNaN(date.getTime())) return { date, source: value };
  }

  const loose = Date.parse(value);
  if (!Number.isNaN(loose)) {
    return { date: new Date(loose), source: value };
  }

  return null;
}

export function isTbd(due: string | undefined): boolean {
  return parseDue(due) === null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatShort(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
