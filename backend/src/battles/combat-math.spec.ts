import { netDamageAfterDefense } from './combat-math';

describe('combat-math', () => {
  it('resta defensa al daño bruto', () => {
    expect(netDamageAfterDefense(50, 12)).toBe(38);
  });

  it('no baja de cero', () => {
    expect(netDamageAfterDefense(10, 25)).toBe(0);
  });

  it('defensa negativa se trata como 0', () => {
    expect(netDamageAfterDefense(20, -5)).toBe(20);
  });
});
