import { Router } from "express";
import cors from "cors";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";

import authMiddleware from "./app/middlewares/authMiddleware";

const routes = Router();

routes.use(cors());

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.get("/sessions", SessionController.index);

routes.put("/users", UserController.update);

routes.get("/users", UserController.index);
routes.get(
  "/teachers",
  (req, res, next) => {
    req.teachersOnly = true;
    return next();
  },
  UserController.index
);

export default routes;
