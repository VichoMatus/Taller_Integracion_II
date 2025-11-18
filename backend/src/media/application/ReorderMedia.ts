import { MediaRepository } from "../domain/MediaRepository";

export class ReorderMedia {
  constructor(private repo: MediaRepository) {}
  async execute(payload: any) {
    return this.repo.reorderMedia(payload);
  }
}
