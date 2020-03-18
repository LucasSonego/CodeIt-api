import * as yup from "yup";

import User from "../models/User";

class UserController {
  async store(req, res) {
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup
        .string()
        .required()
        .email(),
      password: yup
        .string()
        .required()
        .min(6),
      is_teacher: yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Um ou mias campos obrigatorios não foram preenchidos",
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
    const { id, name, email, is_teacher } = await User.create(req.body);

    return res.send({
      id,
      name,
      email,
      is_teacher,
    });
  }
}

export default new UserController();
