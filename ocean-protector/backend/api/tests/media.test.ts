import { describe, it, expect } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { createApp } from '../src/app';

const app = createApp();

describe('Media Upload Validation', () => {
  it('should reject invalid file types', async () => {
    // Create a fake text file
    const filePath = path.resolve(__dirname, 'temp-test-file.txt');
    fs.writeFileSync(filePath, 'this is a text file');

    const response = await request(app)
      .post('/api/v1/media')
      .attach('file', filePath);

    expect(response.status).toBe(422);
    expect(response.body.error.message).toContain('Invalid file type');

    // Cleanup
    fs.unlinkSync(filePath);
  });
});