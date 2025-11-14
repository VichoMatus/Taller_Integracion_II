import { MediaRepository } from "../domain/MediaRepository";

export class ReplaceMedia {
  constructor(private repo: MediaRepository) {}
  async execute(id_media: string, payload: any) {
    return this.repo.replaceMedia(id_media, payload);
  }
}
