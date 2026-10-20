import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as memberService from '../services/memberService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

// Multer middleware for spreadsheet upload (.xlsx, .xls, .csv)
const spreadsheetMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const originalName = file.originalname.toLowerCase();
    const isAllowedExt =
      originalName.endsWith('.xlsx') ||
      originalName.endsWith('.xls') ||
      originalName.endsWith('.csv');

    if (isAllowedExt) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only .xlsx, .xls, and .csv files are supported.', 400));
    }
  },
}).single('file');

export const uploadSpreadsheetMiddleware = (req: Request, res: Response, next: NextFunction) => {
  spreadsheetMulter(req, res, (err: any) => {
    if (err) {
      if (err instanceof AppError) {
        return next(err);
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Maximum size is 10MB.', 400));
      }
      return next(new AppError(err.message || 'File upload failed', 400));
    }
    next();
  });
};

/**
 * Member: Update own profile
 */
export async function updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.member) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const updated = await memberService.updateProfile(req.member.id, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { member: memberService.sanitizeMember(updated) },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Member: Get own profile
 */
export async function getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.member) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const member = await memberService.getAdminMemberById(req.member.id);
    res.json({
      success: true,
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get paginated members list
 */
export async function getAdminMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await memberService.getAdminMembers({ search, status, page, limit });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get single member details
 */
export async function getAdminMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await memberService.getAdminMemberById(req.params.id);
    res.json({
      success: true,
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create member manually
 */
export async function createAdminMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await memberService.adminCreateMember(req.body);
    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update member
 */
export async function updateAdminMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await memberService.adminUpdateMember(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Member updated successfully',
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Preview Bulk Import
 */
export async function previewImport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload a spreadsheet file (.xlsx, .xls, or .csv)' });
      return;
    }

    let mappingOverride;
    if (req.body.columnMapping) {
      try {
        mappingOverride = typeof req.body.columnMapping === 'string'
          ? JSON.parse(req.body.columnMapping)
          : req.body.columnMapping;
      } catch {
        // ignore parse error, use auto detection
      }
    }

    const preview = await memberService.previewMemberImport(req.file.buffer, mappingOverride);

    res.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Execute Bulk Import
 */
export async function executeImport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload a spreadsheet file (.xlsx, .xls, or .csv)' });
      return;
    }

    let mappingOverride;
    if (req.body.columnMapping) {
      try {
        mappingOverride = typeof req.body.columnMapping === 'string'
          ? JSON.parse(req.body.columnMapping)
          : req.body.columnMapping;
      } catch {
        // ignore
      }
    }

    const onDuplicate = req.body.onDuplicate === 'update' ? 'update' : 'skip';

    const result = await memberService.executeMemberImport(
      req.file.buffer,
      mappingOverride,
      onDuplicate
    );

    res.json({
      success: true,
      message: `Import processed: ${result.summary.imported} imported, ${result.summary.updated} updated, ${result.summary.skipped} skipped, ${result.summary.failed} failed.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Download Error CSV
 */
export async function downloadErrorCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const failedRows = req.body.failedRows;
    if (!Array.isArray(failedRows) || failedRows.length === 0) {
      res.status(400).json({ success: false, message: 'No failed rows provided' });
      return;
    }

    // Generate CSV content
    const header = ['Row Number', 'Name', 'Phone', 'Email', 'Birthday', 'Failure Reason'];
    const lines = [header.join(',')];

    for (const r of failedRows) {
      const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      lines.push([
        escape(r.rowNumber),
        escape(r.name),
        escape(r.phone),
        escape(r.email),
        escape(r.birthday),
        escape(r.reason),
      ].join(','));
    }

    const csvContent = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="member_import_errors.csv"');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
}
