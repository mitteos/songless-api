const Router = require("express");
const router = new Router();
import musicRouter from "./music.router";
import genreRouter from "./genre.router";
import yearRouter from "./year.router";
import playlistRouter from "./playlist.router";

router.use("/music", musicRouter);
router.use("/genre", genreRouter);
router.use("/year", yearRouter);
router.use("/playlist", playlistRouter);

export default router;
