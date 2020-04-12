import * as yup from "yup";

import Discipline from "../models/Discipline";
import User from "../models/User";

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
    let disciplines;
    if (req.query.teacher) {
      disciplines = await Discipline.findAll({
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
    } else {
      disciplines = await Discipline.findAll({
        attributes: ["id", "name"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
        ],
      });
    }

    return res.json(disciplines);
  }

  async update(req, res) {
    const schema = yup.object().shape({
      id: yup.string().required(),
      name: yup.string(),
      newTeacher: yup.string(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    if (!(Object.entries(req.body).length > 1)) {
      return res.status(400).json({
        error: "Envie os dados que você deseja alterar",
      });
    }

    let [user, discipline] = await Promise.all([
      User.findByPk(req.userId),
      Discipline.findByPk(req.body.id),
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

    const response = await Discipline.findByPk(req.body.id, {
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
}

export default new DisciplineController();
