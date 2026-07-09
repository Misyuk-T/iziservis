import * as migration_20260709_220552_initial from './20260709_220552_initial';
import * as migration_20260709_221000_rls_lockdown from './20260709_221000_rls_lockdown';

export const migrations = [
  {
    up: migration_20260709_220552_initial.up,
    down: migration_20260709_220552_initial.down,
    name: '20260709_220552_initial'
  },
  {
    up: migration_20260709_221000_rls_lockdown.up,
    down: migration_20260709_221000_rls_lockdown.down,
    name: '20260709_221000_rls_lockdown'
  },
];
