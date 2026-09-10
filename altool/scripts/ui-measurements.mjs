// Reuse the browser/E2E comparator; never trust a saved `valid: true` assertion.
import {readFileSync} from 'node:fs';
import {checkUiMeasurements} from './ui-contracts.mjs';
try {
  const {contracts, observations} = JSON.parse(readFileSync(0, 'utf8'));
  const result = checkUiMeasurements(contracts, observations);
  process.stdout.write(JSON.stringify(result));
  process.exitCode = result.valid ? 0 : 1;
} catch (error) {
  process.stdout.write(JSON.stringify({valid:false, failures:[`Invalid UI measurements: ${error.message}`]}));
  process.exitCode = 1;
}
