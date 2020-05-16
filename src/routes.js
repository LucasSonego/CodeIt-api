import { Router } from "express";
import cors from "cors";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import DisciplineController from "./app/controllers/DisciplineController";
import EnrollmentController from "./app/controllers/EnrollmentController";
import TaskController from "./app/controllers/TaskController";
import AnswerController from "./app/controllers/AnswerController";

import authMiddleware from "./app/middlewares/authMiddleware";

const routes = Router();

routes.use(cors());

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.get("/sessions", SessionController.index);

routes.put("/users", UserController.update);
routes.get("/users", UserController.index);

routes.post("/disciplines", DisciplineController.store);
routes.get("/disciplines", DisciplineController.index);
routes.put("/disciplines/:id", DisciplineController.update);
routes.delete("/disciplines/:id", DisciplineController.delete);

routes.post("/enrollments/:discipline", EnrollmentController.store);
routes.delete("/enrollments/:discipline", EnrollmentController.delete);

routes.post("/tasks", TaskController.store);
routes.put("/tasks/:id", TaskController.update);
routes.delete("/tasks/:id", TaskController.close);
routes.patch("/tasks/:id", TaskController.reopen);
routes.get("/tasks", TaskController.index);

routes.post("/answers/:task", AnswerController.store);

export default routes;
