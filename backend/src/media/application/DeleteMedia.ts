import { MediaRepository } from "../domain/MediaRepository";

export class DeleteMedia {
  constructor(private repo: MediaRepository) {}
  async execute(id_media: string) {
    return this.repo.deleteMedia(id_media);
  }
}
