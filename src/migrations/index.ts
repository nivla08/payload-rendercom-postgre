import * as migration_20260320_120459_baseline_starter from './20260320_120459_baseline_starter';
import * as migration_20260326_104252 from './20260326_104252';

export const migrations = [
  {
    up: migration_20260320_120459_baseline_starter.up,
    down: migration_20260320_120459_baseline_starter.down,
    name: '20260320_120459_baseline_starter',
  },
  {
    up: migration_20260326_104252.up,
    down: migration_20260326_104252.down,
    name: '20260326_104252'
  },
];
