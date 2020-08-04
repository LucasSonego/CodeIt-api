import * as yup from "yup";
import { Op as is } from "sequelize";
import Answer from "../models/Answer";
import Task from "../models/Task";
import Discipline from "../models/Discipline";
import User from "../models/User";

class FeedbackController {
  async store(req, res) {
    const schema = yup.object().shape({
      feedback: yup.string().nullable(),
      code: yup.string().nullable(),
      accepted: yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    const answer = await Answer.findByPk(req.params.answer, {
      include: [
        {
          model: Task,
          as: "task",
          attributes: ["id"],
          include: [
            {
              model: Discipline,
              as: "discipline",
              attributes: ["id"],
              include: [
                {
                  model: User,
                  as: "teacher",
                  attributes: ["id"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!answer) {
      return res.status(404).json({
        error: "Não há nenhuma resposta com este ID",
      });
    }

    if (answer.task.discipline.teacher.id !== req.userId) {
      return res.status(403).json({
        error:
          "Você não tem permissão para dar feedback para as tarefas desta disciplina",
      });
    }

    let date = Date.now();

    let isAccepted = req.body.accepted ? date : null;

    const {
      id,
      code,
      language,
      feedback,
      feedback_code,
      feedback_at,
      accepted_at,
    } = await answer.update(
      {
        feedback: req.body.feedback,
        feedback_code: req.body.code,
        feedback_at: date,
        accepted_at: isAccepted,
      },
      {
        silent: true,
      }
    );

    return res.status(200).json({
      id,
      code,
      language,
      feedback,
      feedback_code,
      feedback_at,
      accepted_at,
    });
  }

  async index(req, res) {
    const user = await User.findByPk(req.userId);

    if (user.is_teacher) {
      const feedbacks = await Answer.findAll({
        where: { feedback_at: { [is.not]: null } },
        attributes: [
          "id",
          "code",
          "language",
          "feedback",
          "feedback_code",
          "feedback_at",
          "accepted_at",
          "updated_at",
        ],
        paranoid: false,
        include: [
          {
            model: User,
            as: "student",
            attributes: ["id", "name", "email"],
          },
          {
            model: Task,
            as: "task",
            attributes: [
              "id",
              "title",
              "description",
              "code",
              "language",
              "closed_at",
            ],
            paranoid: false,
            include: [
              {
                model: Discipline,
                as: "discipline",
                where: { teacher_id: req.userId },
                attributes: ["id", "name"],
                paranoid: false,
              },
            ],
          },
        ],
      });

      return res.json(feedbacks);
    }

    const feedbacks = await Answer.findAll({
      where: { user_id: req.userId, feedback_at: { [is.not]: null } },
      attributes: [
        "id",
        "code",
        "language",
        "feedback",
        "feedback_code",
        "feedback_at",
        "accepted_at",
        "updated_at",
      ],
      include: [
        {
          model: Task,
          as: "task",
          attributes: [
            "id",
            "title",
            "description",
            "code",
            "language",
            "closed_at",
          ],
          paranoid: false,
          include: [
            {
              model: Discipline,
              as: "discipline",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    return res.status(200).json(feedbacks);
  }
}

export default new FeedbackController();
