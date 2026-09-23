// Contracts come from the approved screen Spec, not from the measured page.
// Missing/invalid observations fail closed; a success boolean is not evidence.
export function checkUiMeasurements(contracts, measurements) {
  const failures = [];
  const seen = new Set();
  const near = (value, target) => Number.isFinite(value) && Number.isFinite(target) && Math.abs(value - target) <= 0.5;
  for (const contract of contracts) {
    const matches = measurements.filter(row => row.id === contract.id);
    const measured = matches[0];
    const fail = reason => failures.push(`${contract.id}: ${reason}`);
    if (!contract.id || seen.has(contract.id)) { fail('missing/duplicate contract ID'); continue; }
    seen.add(contract.id);
    if (matches.length !== 1 || !measured || !(measured.count > 0)) { fail('missing/duplicate observation or DOM target'); continue; }
    if (measured.visibleCount !== measured.count) fail('target not rendered');
    if (contract.expectedCount !== undefined && measured.count !== contract.expectedCount) fail('wrong target count');
    if (contract.kind !== 'text' && measured.count !== 1) fail('ambiguous DOM target');
    if (!contract.viewport || !near(measured.viewport?.width, contract.viewport.width) || !near(measured.viewport?.height, contract.viewport.height)) fail('wrong viewport');
    switch (contract.kind) {
      case 'style':
        if (!contract.expected || !Object.keys(contract.expected).length) { fail('missing expected styles'); break; }
        for (const [key, value] of Object.entries(contract.expected)) {
          const matches = typeof value === 'number' ? near(measured.styles?.[key], value) : typeof value === 'string' && value.trim() && measured.styles?.[key] === value;
          if (!matches) fail(`${key}: expected ${value}, got ${measured.styles?.[key]}`);
        }
        break;
      case 'entry':
        if (!Number.isFinite(measured.top) || measured.top < 0 || measured.top >= contract.viewport?.height) fail(`entry below first viewport: ${measured.top}`);
        break;
      case 'text':
        if (!Number.isFinite(contract.minimum) || contract.minimum <= 0 || measured.fontSizes?.length !== measured.count || measured.fontSizes.some(size => !Number.isFinite(size) || size < contract.minimum)) fail('rendered text smaller than contract');
        break;
      case 'icon':
        if (typeof contract.src !== 'string' || !contract.src || measured.src !== contract.src || measured.transform !== 'none') fail('wrong icon source/direction transform');
        break;
      default: fail('unknown contract kind');
    }
  }
  if (!contracts.length) failures.push('No UI contracts supplied');
  for (const row of measurements) if (!seen.has(row.id)) failures.push(`Unexpected observation: ${row.id}`);
  return {valid: failures.length === 0, failures};
}
