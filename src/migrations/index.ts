import * as migration_20260112_063824 from './20260112_063824';
import * as migration_20260112_163613_split_email_sms_settings from './20260112_163613_split_email_sms_settings';

export const migrations = [
  {
    up: migration_20260112_063824.up,
    down: migration_20260112_063824.down,
    name: '20260112_063824',
  },
  {
    up: migration_20260112_163613_split_email_sms_settings.up,
    down: migration_20260112_163613_split_email_sms_settings.down,
    name: '20260112_163613_split_email_sms_settings'
  },
];
