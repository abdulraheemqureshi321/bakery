import { Request, Response, NextFunction } from 'express';
import * as catalogService from '../services/catalogService';

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const includeInactive = req.query.all === 'true';
    const categories = await catalogService.getAllCategories(includeInactive);
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await catalogService.getCategoryById(req.params.id as string);
    res.json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await catalogService.createCategory(req.body);
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await catalogService.updateCategory(req.params.id as string, req.body);
    res.json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await catalogService.deleteCategory(req.params.id as string);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}
