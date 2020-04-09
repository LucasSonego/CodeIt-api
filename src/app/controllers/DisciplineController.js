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
}

export default new DisciplineController();
