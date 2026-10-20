import { Request, Response, NextFunction } from 'express';
import * as catalogService from '../services/catalogService';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await catalogService.getProducts({
      category: req.query.category as string,
      featured: req.query.featured !== undefined ? req.query.featured === 'true' : undefined,
      search: req.query.search as string,
      sort: req.query.sort as any,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
      includeInactive: req.query.all === 'true',
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const products = await catalogService.getFeaturedProducts(limit);
    res.json({ success: true, data: { products } });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await catalogService.getProductBySlug(req.params.slug as string);
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await catalogService.getProductById(req.params.id as string);
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await catalogService.createProduct(req.body);
    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await catalogService.updateProduct(req.params.id as string, req.body);
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await catalogService.deleteProduct(req.params.id as string);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}
