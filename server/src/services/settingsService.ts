import { Setting, ISetting } from '../models';
import { AppError } from '../utils/AppError';

/**
 * Get all settings (admin use).
 */
export async function getAllSettings(): Promise<ISetting[]> {
  return Setting.find().sort({ group: 1, key: 1 });
}

/**
 * Get public settings only (for storefront).
 */
export async function getPublicSettings(): Promise<ISetting[]> {
  return Setting.find({ isPublic: true }).sort({ group: 1, key: 1 });
}

/**
 * Get a single setting by key.
 */
export async function getSettingByKey(key: string): Promise<ISetting | null> {
  return Setting.findOne({ key });
}

/**
 * Get a setting value with a default fallback.
 */
export async function getSettingValue<T = any>(key: string, defaultValue: T): Promise<T> {
  const setting = await Setting.findOne({ key });
  return setting ? setting.value : defaultValue;
}

/**
 * Update a setting value by key.
 */
export async function updateSetting(
  key: string,
  value: any
): Promise<ISetting> {
  const setting = await Setting.findOne({ key });
  if (!setting) {
    throw new AppError(`Setting "${key}" not found`, 404);
  }
  setting.value = value;
  await setting.save();
  return setting;
}

/**
 * Bulk update settings.
 */
export async function bulkUpdateSettings(
  updates: { key: string; value: any }[]
): Promise<ISetting[]> {
  const results: ISetting[] = [];
  for (const { key, value } of updates) {
    const setting = await Setting.findOne({ key });
    if (setting) {
      setting.value = value;
      await setting.save();
      results.push(setting);
    }
  }
  return results;
}

/**
 * Create a setting (used by seed script).
 */
export async function createSetting(data: {
  key: string;
  value: any;
  label: string;
  group: string;
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array';
  isPublic?: boolean;
}): Promise<ISetting> {
  return Setting.findOneAndUpdate(
    { key: data.key },
    {
      $set: {
        value: data.value,
        label: data.label,
        group: data.group,
        type: data.type || 'string',
        isPublic: data.isPublic ?? false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ) as unknown as ISetting;
}
