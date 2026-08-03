import * as migration_20260112_063824 from './20260112_063824';
import * as migration_20260112_163613_split_email_sms_settings from './20260112_163613_split_email_sms_settings';
import * as migration_20260516_125650_add_maintenance_retention from './20260516_125650_add_maintenance_retention';
import * as migration_20260731_171745_add_api_key_strategy from './20260731_171745_add_api_key_strategy';

export const migrations = [
  {
    up: migration_20260112_063824.up,
    down: migration_20260112_063824.down,
    name: '20260112_063824',
  },
  {
    up: migration_20260112_163613_split_email_sms_settings.up,
    down: migration_20260112_163613_split_email_sms_settings.down,
    name: '20260112_163613_split_email_sms_settings',
  },
  {
    up: migration_20260516_125650_add_maintenance_retention.up,
    down: migration_20260516_125650_add_maintenance_retention.down,
    name: '20260516_125650_add_maintenance_retention',
  },
  {
    up: migration_20260731_171745_add_api_key_strategy.up,
    down: migration_20260731_171745_add_api_key_strategy.down,
    name: '20260731_171745_add_api_key_strategy'
  },
];
