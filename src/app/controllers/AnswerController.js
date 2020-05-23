import * as yup from "yup";
import Answer from "../models/Answer";
import Task from "../models/Task";
import Enrollment from "../models/Enrollment";
import User from "../models/User";
import Discipline from "../models/Discipline";
import Answer from "../models/Answer";

class AnswerController {
  async store(req, res) {
    const schema = yup.object().shape({
      code: yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    const [task, userEnrolled, alreadyAnswered] = await Promise.all([
      Task.findByPk(req.params.task, {
        attributes: ["id", "title", "description", "code", "closed_at"],
      }),
      Enrollment.findOne({ where: { student_id: req.userId } }),
      Answer.findOne({
        where: { user_id: req.userId, task_id: req.params.task },
      }),
    ]);

    if (!task) {
      return res.status(404).json({
        error: "Não há nenhuma tarefa com este id",
      });
    }

    if (!userEnrolled) {
      return res.status(401).json({
        error:
          "Você não está matriculado na disciplina a qual esta tarefa foi criada",
      });
    }

    if (alreadyAnswered) {
      return res.status(409).json({
        error: "Você já enviou uma resposta para esta tarefa",
      });
    }

    const { id, code } = await Answer.create({
      id: `${req.params.task}${req.userId}`,
      task_id: req.params.task,
      user_id: req.userId,
      code: req.body.code,
    });

    return res.status(200).json({
      id,
      task,
      code,
    });
  }

  async update(req, res) {
    const schema = yup.object().shape({
      code: yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    const answer = await Answer.findOne({
      where: { user_id: req.userId, task_id: req.params.task },
      attributes: ["id", "code", "accepted_at"],
      include: [
        {
          model: Task,
          as: "task",
          attributes: ["id", "title", "description", "code", "closed_at"],
        },
      ],
    });

    if (!answer) {
      return res.status(404).json({
        error: "Não há uma resposta sua para esta tarefa",
      });
    }

    if (answer.accepted_at !== null) {
      return res.status(403).json({
        error: "Você não pode alterar uma resposta que já foi aceita",
      });
    }

    await answer.update({ code: req.body.code });

    return res.json({
      id: answer.id,
      task: answer.task,
      code: req.body.code,
    });
  }

  async index(req, res) {
    const task = await Task.findByPk(req.params.task, {
      attributes: ["id"],
      include: [
        {
          model: Discipline,
          as: "discipline",
          attributes: ["id"],
          paranoid: false,
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id"],
            },
          ],
        },
        {
          model: Answer,
          as: "answers",
          attributes: ["code", "feedback", "feedback_code", "accepted_at"],
          include: [
            {
              model: User,
              as: "student",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        error: "Não há nenhuma tarefa com este ID",
      });
    }

    let response;

    if (req.userId === task.discipline.teacher.id) {
      response = task.answers;
    } else {
      response = task.answers.find(answer => answer.student.id === req.userId);
      if (!response) {
        return res.status(404).json({
          error: "Você não enviou uma resposta para esta tarefa",
        });
      }
    }

    return res.json(response);
  }
}

export default new AnswerController();
