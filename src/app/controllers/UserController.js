import User from "../models/User";

class UserController {
  async store(req, res) {
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
