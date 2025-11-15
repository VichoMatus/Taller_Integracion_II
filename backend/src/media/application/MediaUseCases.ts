import { MediaRepository } from "../domain/MediaRepository";

export class UploadMedia {
  constructor(private repo: MediaRepository) {}
  async execute(payload: any) {
    return this.repo.uploadMedia(payload);
  }
}

export class ListMedia {
  constructor(private repo: MediaRepository) {}
  async execute(params?: any) {
    return this.repo.listMedia(params);
  }
}
// Aquí se agregarán los demás casos de uso para los otros endpoints

export class MediaStatus {
  constructor(private repo: MediaRepository) {}
  async execute() {
    // Puede ser un ping simple al endpoint de media
    return this.repo.listMedia({ limit: 1 });
  }
}
