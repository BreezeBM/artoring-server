import express from "express";
const router = express.Router();

import search from "../../controller/search/search.js";

router.get("/", search);

export default router;
