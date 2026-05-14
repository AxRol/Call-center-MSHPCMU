import express from "express";
import {
  getLocalite,
  createLocalite,
  getLocaliteByID,
  editLocalite,
  deleteLocalite,
} from "../controllers/localiteController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", getLocalite);
router.get("/:id", getLocaliteByID);
router.post("/", createLocalite);
router.put("/:id", editLocalite);
router.delete("/:id", deleteLocalite);

export default router;
