import Enrollment from "../models/Enrollment";
import Discipline from "../models/Discipline";

class EnrollmentController {
  async store(req, res) {
    const [discipline, alreadyEnrolled] = await Promise.all([
      Discipline.findByPk(req.params.discipline),
      Enrollment.findOne({
        where: {
          discipline_id: req.params.discipline,
          student_id: req.userId,
        },
      }),
    ]);

    if (!discipline) {
      return res.status(404).json({
        error: "Não há nenhuma disciplina cadastrada com este código",
      });
    }

    if (alreadyEnrolled) {
      return res.status(409).json({
        error: "Você já está matriculado nesta disciplina",
      });
    }

    const enrollment = await Enrollment.create({
      discipline_id: req.params.discipline,
      student_id: req.userId,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findOne({
      where: { student_id: req.userId, discipline_id: req.params.discipline },
    });

    if (!enrollment) {
      return res.status(404).json({
        error: "Você não está matriculado em uma disciplina com este código",
      });
    }

    enrollment.destroy();
    return res.json({
      message: "Matrícula removida",
    });
  }
}

export default new EnrollmentController();
