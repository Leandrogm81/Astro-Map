import { describe, it, expect } from 'vitest';
import { getSectStatus, getSectRole } from '../lib/traditional/sect';

describe('getSectStatus', () => {
  it('day chart: sun is in_sect', () => {
    expect(getSectStatus('sun', true)).toBe('in_sect');
  });

  it('day chart: jupiter is in_sect', () => {
    expect(getSectStatus('jupiter', true)).toBe('in_sect');
  });

  it('day chart: saturn is in_sect', () => {
    expect(getSectStatus('saturn', true)).toBe('in_sect');
  });

  it('day chart: moon is out_of_sect', () => {
    expect(getSectStatus('moon', true)).toBe('out_of_sect');
  });

  it('day chart: venus is out_of_sect', () => {
    expect(getSectStatus('venus', true)).toBe('out_of_sect');
  });

  it('day chart: mars is out_of_sect', () => {
    expect(getSectStatus('mars', true)).toBe('out_of_sect');
  });

  it('night chart: moon is in_sect', () => {
    expect(getSectStatus('moon', false)).toBe('in_sect');
  });

  it('night chart: venus is in_sect', () => {
    expect(getSectStatus('venus', false)).toBe('in_sect');
  });

  it('night chart: mars is in_sect', () => {
    expect(getSectStatus('mars', false)).toBe('in_sect');
  });

  it('night chart: sun is out_of_sect', () => {
    expect(getSectStatus('sun', false)).toBe('out_of_sect');
  });

  it('night chart: jupiter is out_of_sect', () => {
    expect(getSectStatus('jupiter', false)).toBe('out_of_sect');
  });

  it('night chart: saturn is out_of_sect', () => {
    expect(getSectStatus('saturn', false)).toBe('out_of_sect');
  });

  it('mercury is always mercury_variable', () => {
    expect(getSectStatus('mercury', true)).toBe('mercury_variable');
    expect(getSectStatus('mercury', false)).toBe('mercury_variable');
  });
});

describe('getSectRole', () => {
  it('day chart: jupiter is benefic_of_sect', () => {
    expect(getSectRole('jupiter', true)).toBe('benefic_of_sect');
  });

  it('day chart: saturn is malefic_of_sect', () => {
    expect(getSectRole('saturn', true)).toBe('malefic_of_sect');
  });

  it('day chart: sun is luminary', () => {
    expect(getSectRole('sun', true)).toBe('luminary');
  });

  it('day chart: mars is malefic_out_of_sect', () => {
    expect(getSectRole('mars', true)).toBe('malefic_out_of_sect');
  });

  it('day chart: venus is benefic_out_of_sect', () => {
    expect(getSectRole('venus', true)).toBe('benefic_out_of_sect');
  });

  it('day chart: moon is luminary', () => {
    expect(getSectRole('moon', true)).toBe('luminary');
  });

  it('night chart: mars is malefic_of_sect', () => {
    expect(getSectRole('mars', false)).toBe('malefic_of_sect');
  });

  it('night chart: venus is benefic_of_sect', () => {
    expect(getSectRole('venus', false)).toBe('benefic_of_sect');
  });

  it('night chart: moon is luminary', () => {
    expect(getSectRole('moon', false)).toBe('luminary');
  });

  it('night chart: saturn is malefic_out_of_sect', () => {
    expect(getSectRole('saturn', false)).toBe('malefic_out_of_sect');
  });

  it('night chart: jupiter is benefic_out_of_sect', () => {
    expect(getSectRole('jupiter', false)).toBe('benefic_out_of_sect');
  });

  it('night chart: sun is luminary', () => {
    expect(getSectRole('sun', false)).toBe('luminary');
  });

  it('mercury is always mercury_variable', () => {
    expect(getSectRole('mercury', true)).toBe('mercury_variable');
    expect(getSectRole('mercury', false)).toBe('mercury_variable');
  });
});
