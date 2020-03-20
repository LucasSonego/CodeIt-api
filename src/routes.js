import { Router } from "express";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";

import authMiddleware from "./app/middlewares/authMiddleware";

const routes = Router();

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

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
