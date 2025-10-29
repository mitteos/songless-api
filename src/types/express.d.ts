declare global {
  namespace Express {
    interface Request {
      // Файл, загруженный через upload.single(...)
      file?: Express.Multer.File;
      // Файлы, загруженные через upload.array(...)
      files?: Express.Multer.File[];
    }
  }
}

export {};
