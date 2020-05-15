import * as yup from "yup";
import Answer from "../models/Answer";
import Task from "../models/Task";
import Enrollment from "../models/Enrollment";

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
      Task.findByPk(req.params.id),
      Enrollment.findOne({ where: { student_id: req.userId } }),
      Answer.findOne({
        where: { user_id: req.userId, task_id: req.params.id },
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

    await Answer.create({
      id: `${req.params.id}${req.userId}`,
      task_id: req.params.id,
      user_id: req.userId,
      code: req.body.code,
    });

    return res.status(200).json({
      message: "Resposta enviada com sucesso",
    });
  }
}

export default new AnswerController();
