import * as yup from "yup";
import { Op as is } from "sequelize";

import User from "../models/User";

class UserController {
  async store(req, res) {
    const schema = yup.object().shape({
      id: yup
        .string()
        .required()
        .test(value => value && !!value.match(/^[0-9]+$/)),
      name: yup.string().required(),
      email: yup.string().required().email(),
      password: yup.string().required().min(6),
      is_teacher: yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    const emailAlreadyUsed = await User.findOne({
      where: { email: req.body.email },
    });
    if (emailAlreadyUsed) {
      return res.status(409).json({
        error: "Este email já esta cadastrado para outro usuario",
      });
    }

    const idAlreadyUsed = await User.findOne({
      where: { id: req.body.id },
    });
    if (idAlreadyUsed) {
      return res.status(409).json({
        error: "Este ID já esta cadastrado para outro usuario",
      });
    }

    try {
      const { id, name, email, is_teacher } = await User.create(req.body);
      return res.send({
        id,
        name,
        email,
        is_teacher,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.name,
      });
    }
  }

  async update(req, res) {
    if (!req.userId) {
      return res.status(401).json({
        error: "Autenticação necessaria",
      });
    }

    const user = await User.findByPk(req.userId);

    const schema = yup.object().shape({
      name: yup.string(),
      email: yup.string().email(),
      password: yup.string().min(6),
      oldPassword: yup
        .string()
        .min(6)
        .when("password", (password, field) => {
          return password ? field.required() : field;
        }),
      is_teacher: yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailAlreadyUsed = await User.findOne({
        where: { email: req.body.email },
      });
      if (emailAlreadyUsed) {
        return res.status(409).json({
          error: "Este email já esta cadastrado para outro usuario",
        });
      }
    }

    if (req.body.password) {
      if (req.body.oldPassword) {
        if (!(await user.checkPassword(req.body.oldPassword))) {
          return res.status(401).json({
            error: "Senha antiga incorreta",
          });
        }
      }
    }

    const { id, name, email, is_teacher } = await user.update(req.body);
    return res.json({
      id,
      name,
      email,
      is_teacher,
    });
  }

  async index(req, res) {
    let response;

    if (!req.query.type) {
      response = await User.findAll({
        where: { id: { [is.not]: req.userId } },
      });
    } else if (req.query.type === "teachers") {
      response = await User.findAll({
        where: { is_teacher: true, id: { [is.not]: req.userId } },
      });
    } else if (req.query.type === "students") {
      response = await User.findAll({
        where: { is_teacher: false, id: { [is.not]: req.userId } },
      });
    }

    const users = response.map(user => {
      const { id, name, email, is_teacher } = user.dataValues;

      return { id, name, email, is_teacher };
    });

    return res.json(users);
  }
}

export default new UserController();
