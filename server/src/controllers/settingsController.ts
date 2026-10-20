import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settingsService';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getAllSettings();
    res.json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
}

export async function getPublic(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getPublicSettings();
    // Transform to a key-value map for easier frontend consumption
    const map: Record<string, any> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    res.json({ success: true, data: { settings: map } });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.params.key as string;
    const { value } = req.body;
    const setting = await settingsService.updateSetting(key, value);
    res.json({ success: true, data: { setting } });
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const { settings } = req.body;
    const updated = await settingsService.bulkUpdateSettings(settings);
    res.json({ success: true, data: { settings: updated } });
  } catch (error) {
    next(error);
  }
}
