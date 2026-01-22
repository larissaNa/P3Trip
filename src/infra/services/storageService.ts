import { supabase } from "../supabase/supabase";

export class StorageService {
  async getImageUrls(imagePaths: string[]): Promise<string[]> {
    const urls: string[] = [];
    for (const path of imagePaths) {
      const { data } = await supabase.storage.from("viagens").createSignedUrl(path, 60 * 60);
      if (data?.signedUrl) {
        urls.push(data.signedUrl);
      }
    }
    return urls;
  }

  async uploadImage(file: File | Blob, filePath: string) {
    const { data, error } = await supabase.storage.from("viagens").upload(filePath, file, { upsert: true });
    if (error) throw error;
    return data.path;
  }

  async removeImages(paths: string[]) {
    const { error } = await supabase.storage.from("viagens").remove(paths);
    if (error) throw error;
    return true;
  }
}
