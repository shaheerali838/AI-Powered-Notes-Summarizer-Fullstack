import express, { Router } from "express";
import { getProfile } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const route = express.Router();
route.get("/profile", authMiddleware, getProfile);

export default route;
