const Router = require("express");
const router = new Router();
import {
  create,
  getAll,
  getOne,
  remove,
  update,
} from "../controllers/genre.controller";

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.delete("/:id", remove);
router.put("/:id", update);

export default router;
