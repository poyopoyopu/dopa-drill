// All question pools, keyed by pool id (used by skills.js `gen: ['quiz', { pool }]`).
import * as labor from './bank_labor.js';
import * as vehicle from './bank_vehicle.js';
import * as traffic from './bank_traffic.js';
import * as cargo from './bank_cargo.js';
import * as bus from './bank_bus.js';
import * as practice from './bank_practice.js';

export const POOLS = { ...labor, ...vehicle, ...traffic, ...cargo, ...bus, ...practice };

// Every bank entry must have a question, 2-4 choices and an explanation.
export function validatePools(pools = POOLS) {
  const errors = [];
  for (const [id, list] of Object.entries(pools)) {
    list.forEach((it, i) => {
      const w = `${id}[${i}]`;
      if (!it.q) errors.push(`${w}: no question`);
      if (!Array.isArray(it.c) || it.c.length < 2 || it.c.length > 4) errors.push(`${w}: bad choices`);
      else if (new Set(it.c).size !== it.c.length) errors.push(`${w}: duplicate choices`);
      if (!it.e) errors.push(`${w}: no explanation`);
    });
  }
  return errors;
}
