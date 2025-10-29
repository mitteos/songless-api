import { Router, Request, Response } from "express";
const router = Router();
import {
  createManyMusic,
  createMusic,
  getAll,
  getOne,
  remove,
  update,
} from "../controllers/music.controller";
import { upload } from "../middleware/upload";

router.post("/", upload.single("audio_url"), createMusic);
router.post("/many", upload.array("audio_url"), createManyMusic);
router.get("/", getAll);
router.get("/:id", getOne);
router.delete("/:id", remove);
router.put("/:id", update);

export default router;
