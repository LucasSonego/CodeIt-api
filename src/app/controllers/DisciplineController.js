import * as yup from "yup";

import Discipline from "../models/Discipline";
import User from "../models/User";
import Enrollment from "../models/Enrollment";

class DisciplineController {
  async store(req, res) {
    const schema = yup.object().shape({
      id: yup.string().required(),
      name: yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    const user = await User.findByPk(req.userId);

    if (!user.is_teacher) {
      return res.status(403).json({
        error: "Apenas professores podem criar disciplinas",
      });
    }

    const alreadyExists = await Discipline.findByPk(req.body.id, {
      paranoid: false,
    });

    if (alreadyExists) {
      return res.status(409).json({
        error: "Já existe uma disciplina cadastrada com este código",
      });
    }

    try {
      const discipline = await Discipline.create({
        id: req.body.id,
        name: req.body.name,
        teacher_id: req.userId,
      });

      return res.json({
        id: discipline.id,
        name: discipline.name,
        teacher: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: error.name,
      });
    }
  }

  async index(req, res) {
    if (req.query.teacher) {
      const response = await Discipline.findAll({
        where: { teacher_id: req.query.teacher },
        attributes: ["id", "name"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      return res.json(response);
    } else if (req.query.id) {
      const response = await Discipline.findByPk(req.query.id, {
        attributes: ["id", "name"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
          {
            model: Enrollment,
            as: "enrollments",
            attributes: ["created_at"],
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

      if (!response) {
        return res.status(404).json({
          error: "Não há nenhuma disciplina cadastrada com este código",
        });
      }

      return res.json(response);
    }

    const [userDisciplines, allDisciplines] = await Promise.all([
      Enrollment.findAll({
        where: { student_id: req.userId },
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
      }),

      Discipline.findAll({
        attributes: ["id", "name"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
        ],
      }),
    ]);

    const enrolledDisciplines = userDisciplines.map(
      enrollment => enrollment.discipline
    );

    const otherDisciplines = allDisciplines.filter(discipline => {
      const enrolled = enrolledDisciplines.find(
        enrolledDiscipline => enrolledDiscipline.id === discipline.id
      );
      if (!enrolled) {
        return discipline;
      }
    });

    const response = {
      enrolled_disciplines: [...enrolledDisciplines],
      disciplines: [...otherDisciplines],
    };

    return res.json(response);
  }

  async update(req, res) {
    const schema = yup.object().shape({
      name: yup.string(),
      newTeacher: yup.string(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    if (!(Object.entries(req.body).length > 0)) {
      return res.status(400).json({
        error: "Envie os dados que você deseja alterar",
      });
    }

    let [user, discipline] = await Promise.all([
      User.findByPk(req.userId),
      Discipline.findByPk(req.params.id),
    ]);

    if (!(user.id === discipline.teacher_id)) {
      return res.status(403).json({
        error: "Você não tem permissão para fazer alterações nesta disciplina",
      });
    }

    if (req.body.newTeacher) {
      let newTeacher = await User.findByPk(req.body.newTeacher);
      if (!newTeacher.is_teacher) {
        return res.status(400).json({
          error: "O usuário inserido não existe ou não é um professor",
        });
      } else {
        await discipline.update({
          teacher_id: req.body.newTeacher,
          ...req.body,
        });
      }
    } else {
      if (req.body.name) {
        await discipline.update({ name: req.body.name });
      }
    }

    const response = await Discipline.findByPk(req.params.id, {
      attributes: ["id", "name"],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    return res.json(response);
  }

  async delete(req, res) {
    const [user, discipline] = await Promise.all([
      User.findByPk(req.userId),
      Discipline.findByPk(req.params.id),
    ]);

    if (!discipline) {
      return res.status(404).json({
        error: "Não há nenhuma disciplina cadastrada com este código",
      });
    }

    if (user.id !== discipline.teacher_id) {
      return res.status(403).json({
        error: "Você não tem permissão para fazer alterações nesta disciplina",
      });
    }

    await discipline.destroy();
    return res.status(200).json({
      message: "Disciplina removida com sucesso",
    });
  }
}

export default new DisciplineController();
