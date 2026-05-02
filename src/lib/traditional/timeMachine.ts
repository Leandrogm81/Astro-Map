export type TimeAdjustmentUnit = 'day' | 'hour';

export interface DateTimeInputs {
  dateStr: string;
  timeStr: string;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatDateTimeInput(date: Date): DateTimeInputs {
  return {
    dateStr: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    timeStr: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function createDateFromInputs(dateStr: string, timeStr: string): Date | null {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  if ([year, month, day, hours, minutes].some((value) => Number.isNaN(value))) {
    return null;
  }

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function adjustDateTimeInput(
  dateStr: string,
  timeStr: string,
  amount: number,
  unit: TimeAdjustmentUnit
): DateTimeInputs | null {
  const date = createDateFromInputs(dateStr, timeStr);
  if (!date) return null;

  if (unit === 'day') {
    date.setDate(date.getDate() + amount);
  } else {
    date.setHours(date.getHours() + amount);
  }

  return formatDateTimeInput(date);
}
