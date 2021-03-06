import jwt from "jsonwebtoken";
import * as yup from "yup";

import User from "../models/User";
import authConfig from "../../config/auth";

class SessionController {
  async store(req, res) {
    const schema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mais campos não foram preenchidos corretamente",
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        error: "Usuário ou senha inválidos",
      });
    }

    const { id, name, is_teacher } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        is_teacher,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }

  async index(req, res) {
    const { id, name, email, is_teacher } = await User.findByPk(req.userId);
    let response = {
      user: {
        id,
        name,
        email,
        is_teacher,
      },
    };
    if (req.query.newtoken) {
      response = {
        ...response,
        token: jwt.sign({ id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      };
    }
    return res.json(response);
  }
}

export default new SessionController();
