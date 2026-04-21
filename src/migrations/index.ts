import * as migration_20260320_120459_baseline_starter from './20260320_120459_baseline_starter';
import * as migration_20260326_104252 from './20260326_104252';
import * as migration_20260421_094337 from './20260421_094337';

export const migrations = [
  {
    up: migration_20260320_120459_baseline_starter.up,
    down: migration_20260320_120459_baseline_starter.down,
    name: '20260320_120459_baseline_starter',
  },
  {
    up: migration_20260326_104252.up,
    down: migration_20260326_104252.down,
    name: '20260326_104252',
  },
  {
    up: migration_20260421_094337.up,
    down: migration_20260421_094337.down,
    name: '20260421_094337'
  },
];
