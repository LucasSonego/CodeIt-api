import * as yup from "yup";
import randomId from "random-base64-string";

import Discipline from "../models/Discipline";
import Task from "../models/Task";
import User from "../models/User";
import Enrollment from "../models/Enrollment";
import Answer from "../models/Answer";

class TaskController {
  async store(req, res) {
    const schema = yup.object().shape({
      title: yup.string().required(),
      description: yup.string().required(),
      code: yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    const discipline = await Discipline.findByPk(req.params.discipline, {
      attributes: ["id", "name"],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!discipline) {
      return res.status(400).json({
        error: "Não há nenhuma disciplina cadastrada com este código",
      });
    }

    if (discipline.teacher.id !== req.userId) {
      return res.status(401).json({
        error: "Você não tem permissão para criar tarefas para esta disciplina",
      });
    }

    let taskId;
    let validId = false;
    while (!validId) {
      taskId = `${discipline.id}${randomId(6)}`;
      validId = !(await Task.findByPk(taskId, { paranoid: false }));
    }

    const { id, title, description, code } = await Task.create({
      id: taskId,
      discipline_id: discipline.id,
      title: req.body.title,
      description: req.body.description,
      code: req.body.code,
    });

    return res.json({
      id,
      discipline,
      title,
      description,
      code,
    });
  }

  async index(req, res) {
    if (req.query.discipline) {
      const [discipline, tasks] = await Promise.all([
        Discipline.findByPk(req.query.discipline),
        Task.findAll({
          where: { discipline_id: req.query.discipline },
          attributes: ["id", "title", "description", "code", "closed_at"],
          paranoid: false,
          include: [
            {
              model: Answer,
              as: "answers",
              attributes: [
                "id",
                "code",
                "feedback",
                "feedback_code",
                "accepted_at",
              ],
              include: [
                {
                  model: User,
                  as: "student",
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        }),
      ]);

      if (!discipline) {
        return res.status(404).json({
          error: "Não há nenhuma disciplina cadastrada com este código",
        });
      }

      let response = [...tasks];
      if (discipline.teacher_id !== req.userId) {
        response = tasks.map(task => {
          let answer = task.answers.find(answer =>
            answer.student.id === req.userId ? answer : null
          );
          if (answer) {
            return {
              id: task.id,
              title: task.title,
              description: task.description,
              code: task.code,
              closed_at: task.closed_at,
              answer: {
                code: answer.code,
                feedback: answer.feedback,
                feedback_code: answer.feedback_code,
                accepted_at: answer.accepted_at,
              },
            };
          }
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            code: task.code,
            closed_at: task.closed_at,
          };
        });
      }

      let open = [];
      let closed = [];
      response.map(task => {
        if (task.closed_at === null) {
          open.push(task);
        } else {
          closed.push(task);
        }
      });

      return res.json({
        open,
        closed,
      });
    }

    const data = await Discipline.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: Enrollment,
          as: "enrollments",
          where: { student_id: req.userId },
          required: true,
          attributes: [],
        },
        {
          model: Task,
          as: "tasks",
          attributes: ["id", "title", "description", "code", "closed_at"],
          paranoid: false,
          include: [
            {
              model: Answer,
              as: "answers",
              where: { user_id: req.userId },
              attributes: ["code", "feedback", "feedback_code", "accepted_at"],
              required: false,
            },
          ],
        },
      ],
    });

    const response = data.map(discipline => {
      let tasks = discipline.tasks.map(task => {
        let answer = task.answers[0] ? task.answers[0] : null;
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          code: task.code,
          closed_at: task.closed_at,
          answer,
        };
      });

      return {
        id: discipline.id,
        name: discipline.name,
        tasks,
      };
    });

    return res.json(response);
  }

  async update(req, res) {
    const schema = yup.object().shape({
      title: yup.string(),
      description: yup.string(),
      code: yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    if (!req.body.title && !req.body.description && !req.body.code) {
      return res.status(400).json({
        error: "Não há nada a ser alterado",
      });
    }

    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Discipline,
          as: "discipline",
          attributes: ["id", "name"],
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        error: "Não há nenhuma tarefa com este id",
      });
    }

    if (task.discipline.teacher.id !== req.userId) {
      return res.status(401).json({
        error:
          "Você não tem permissão para fazer alterações nas atividades desta disciplina",
      });
    }

    let updatedTask = {};
    req.body.title && (updatedTask = { title: req.body.title });
    req.body.description &&
      (updatedTask = { ...updatedTask, description: req.body.description });
    req.body.code && (updatedTask = { ...updatedTask, code: req.body.code });

    let response = await task.update(updatedTask);

    return res.json({
      id: response.id,
      discipline: response.discipline,
      title: response.title,
      description: response.description,
      code: response.code,
    });
  }

  async close(req, res) {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Discipline,
          as: "discipline",
          attributes: ["teacher_id"],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        error: "Não há nenhuma tarefa com este id",
      });
    }

    if (task.discipline.teacher_id !== req.userId) {
      return res.status(401).json({
        error:
          "Você não tem permissão para fazer alterações nas atividades desta disciplina",
      });
    }

    await task.destroy();
    return res.status(200).json({
      message: "Tarefa fechada com sucesso",
    });
  }

  async reopen(req, res) {
    const task = await Task.findByPk(req.params.id, {
      paranoid: false,
      include: [
        {
          model: Discipline,
          as: "discipline",
          attributes: ["teacher_id"],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        error: "Não há nenhuma tarefa com este id",
      });
    }

    if (task.discipline.teacher_id !== req.userId) {
      return res.status(401).json({
        error:
          "Você não tem permissão para fazer alterações nas atividades desta disciplina",
      });
    }

    await task.restore();
    return res.status(200).json({
      message: "Tarefa reaberta com sucesso",
    });
  }
}

export default new TaskController();
