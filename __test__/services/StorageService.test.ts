import { StorageService } from '../../src/model/services/StorageService';
import { supabase } from '../../src/infra/supabase/supabase';

jest.mock('../../src/infra/supabase/supabase');

describe('StorageService', () => {
  let service: StorageService;
  const mockStorageFrom = jest.fn();

  beforeEach(() => {
    service = new StorageService();
    (supabase.storage as any).from = mockStorageFrom;
    jest.clearAllMocks();
  });

  describe('getImageUrls', () => {
    it('should return signed urls', async () => {
      const paths = ['path1', 'path2'];
      const mockCreateSignedUrl = jest.fn()
        .mockResolvedValueOnce({ data: { signedUrl: 'url1' }, error: null })
        .mockResolvedValueOnce({ data: { signedUrl: 'url2' }, error: null });

      mockStorageFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl });

      const urls = await service.getImageUrls(paths);

      expect(mockStorageFrom).toHaveBeenCalledWith('viagens');
      expect(mockCreateSignedUrl).toHaveBeenCalledTimes(2);
      expect(urls).toEqual(['url1', 'url2']);
    });
  });

  describe('uploadImage', () => {
    it('should upload image and return path', async () => {
      const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'uploaded/path' }, error: null });
      mockStorageFrom.mockReturnValue({ upload: mockUpload });

      const file = { uri: 'file-uri' } as any; // Mock file object
      const path = await service.uploadImage(file, 'dest/path');

      expect(mockStorageFrom).toHaveBeenCalledWith('viagens');
      expect(mockUpload).toHaveBeenCalledWith('dest/path', file, { upsert: true });
      expect(path).toBe('uploaded/path');
    });

    it('should throw error on failure', async () => {
      const mockUpload = jest.fn().mockResolvedValue({ data: null, error: { message: 'Upload failed' } });
      mockStorageFrom.mockReturnValue({ upload: mockUpload });

      await expect(service.uploadImage({} as any, 'path')).rejects.toEqual({ message: 'Upload failed' });
    });
  });

  describe('removeImages', () => {
    it('should remove images', async () => {
      const mockRemove = jest.fn().mockResolvedValue({ error: null });
      mockStorageFrom.mockReturnValue({ remove: mockRemove });

      const result = await service.removeImages(['path1']);

      expect(mockRemove).toHaveBeenCalledWith(['path1']);
      expect(result).toBe(true);
    });

    it('should throw error on failure', async () => {
      const mockRemove = jest.fn().mockResolvedValue({ error: { message: 'Remove failed' } });
      mockStorageFrom.mockReturnValue({ remove: mockRemove });

      await expect(service.removeImages(['path1'])).rejects.toEqual({ message: 'Remove failed' });
    });
  });
});
