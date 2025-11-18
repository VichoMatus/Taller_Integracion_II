import { MediaRepository } from "../domain/MediaRepository";

export class MarkMediaAsPrincipal {
  constructor(private repo: MediaRepository) {}
  async execute(id_media: string) {
    return this.repo.markAsPrincipal(id_media);
  }
}
