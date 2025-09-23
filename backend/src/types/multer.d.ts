import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer?: Buffer;
    }
  }
}
