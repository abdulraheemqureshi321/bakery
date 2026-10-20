import { describe, it, expect, vi } from 'vitest';
import supertest from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import env from '../config/env';

// Mock Cloudinary v2 uploader
vi.mock('../config/cloudinary', () => {
  return {
    default: {
      uploader: {
        upload_stream: (_options: any, callback: any) => {
          const stream = {
            end: (_buffer: Buffer) => {
              callback(null, {
                secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/soultalk_pastry/sample.webp',
                public_id: 'soultalk_pastry/sample',
              });
            },
          };
          return stream;
        },
        destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
      },
    },
  };
});

const request = supertest(app);

describe('Cloudinary Upload Service & Endpoint', () => {
  const adminToken = jwt.sign(
    { id: 'admin_id_123', role: 'admin' },
    env.JWT_ACCESS_SECRET
  );
  const memberToken = jwt.sign(
    { id: 'member_id_123', role: 'member' },
    env.JWT_ACCESS_SECRET
  );

  it('rejects uploads from non-admin members with 403', async () => {
    const res = await request
      .post('/api/v1/admin/uploads')
      .set('Cookie', [`accessToken=${memberToken}`])
      .attach('image', Buffer.from('fake image content'), 'test.jpg');

    expect(res.status).toBe(403);
  });

  it('rejects uploads with invalid file types (e.g. text/pdf)', async () => {
    const res = await request
      .post('/api/v1/admin/uploads')
      .set('Cookie', [`accessToken=${adminToken}`])
      .attach('image', Buffer.from('%PDF-1.4...'), 'document.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Only JPG, PNG, and WebP are allowed');
  });

  it('successfully uploads valid image for admin and returns url + publicId', async () => {
    const res = await request
      .post('/api/v1/admin/uploads')
      .set('Cookie', [`accessToken=${adminToken}`])
      .attach('image', Buffer.from('fake-valid-jpg-bytes'), {
        filename: 'cake.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toContain('https://res.cloudinary.com');
    expect(res.body.data.publicId).toBe('soultalk_pastry/sample');
  });

  it('deletes image by publicId for admin', async () => {
    const res = await request
      .delete('/api/v1/admin/uploads/soultalk_pastry/sample')
      .set('Cookie', [`accessToken=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Image deleted');
  });
});
