import { supabase } from "../../infra/supabase/supabase";

export class StorageService {

  // Gera URLs assinadas a partir dos paths salvos no banco
  async getImageUrls(imagePaths: string[]): Promise<string[]> {
    const urls: string[] = [];

    for (const path of imagePaths) {
      const { data, error } = await supabase
        .storage
        .from("viagens")
        .createSignedUrl(path, 60 * 60); // 1h

      if (data?.signedUrl) {
        urls.push(data.signedUrl);
      }
    }
    return urls;
  }

  // Upload de imagem
  async uploadImage(file: File | Blob, filePath: string) {
    const { data, error } = await supabase
      .storage
      .from("viagens")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) throw error;
    return data.path;
  }

  // Remover imagem
  async removeImages(paths: string[]) {
    const { error } = await supabase
      .storage
      .from("viagens")
      .remove(paths);

    if (error) throw error;

    return true;
  }
}
