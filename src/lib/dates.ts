const DATE_TIME_ZONE_RE = /(Z|[+-]\d{2}:?\d{2})$/i;

export function parsePostDate(value: string): Date {
  const raw = value.trim();
  const normalized = raw.replace(' ', 'T');

  if (DATE_TIME_ZONE_RE.test(normalized)) {
    return new Date(normalized);
  }

  const [datePart, timePart = '00:00:00'] = normalized.split('T');
  const time = timePart.length === 5 ? `${timePart}:00` : timePart;

  return new Date(`${datePart}T${time}Z`);
}

export function postDateToISOString(value?: string): string | undefined {
  return value ? parsePostDate(value).toISOString() : undefined;
}

export function formatPostDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  return value ? parsePostDate(value).toLocaleDateString('en-US', { timeZone: 'UTC', ...options }) : '';
}
