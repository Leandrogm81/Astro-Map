import { describe, expect, it } from 'vitest';
import {
  adjustDateTimeInput,
  createDateFromInputs,
  formatDateTimeInput,
} from '@/lib/traditional/timeMachine';

describe('traditional time machine helpers', () => {
  it('parses valid date and time inputs', () => {
    const date = createDateFromInputs('2026-01-31', '23:30');

    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(31);
    expect(date?.getHours()).toBe(23);
    expect(date?.getMinutes()).toBe(30);
  });

  it('returns null for malformed inputs', () => {
    expect(createDateFromInputs('invalid', '23:30')).toBeNull();
    expect(createDateFromInputs('2026-01-31', 'bad')).toBeNull();
  });

  it('formats date and time back to input strings', () => {
    const values = formatDateTimeInput(new Date(2026, 0, 5, 7, 9));

    expect(values).toEqual({
      dateStr: '2026-01-05',
      timeStr: '07:09',
    });
  });

  it('adjusts time across midnight and month boundaries', () => {
    expect(adjustDateTimeInput('2026-01-31', '23:30', 1, 'hour')).toEqual({
      dateStr: '2026-02-01',
      timeStr: '00:30',
    });

    expect(adjustDateTimeInput('2026-03-01', '00:30', -1, 'hour')).toEqual({
      dateStr: '2026-02-28',
      timeStr: '23:30',
    });
  });

  it('adjusts by whole days', () => {
    expect(adjustDateTimeInput('2026-01-31', '12:00', 1, 'day')).toEqual({
      dateStr: '2026-02-01',
      timeStr: '12:00',
    });

    expect(adjustDateTimeInput('2026-02-01', '12:00', -1, 'day')).toEqual({
      dateStr: '2026-01-31',
      timeStr: '12:00',
    });
  });
});
