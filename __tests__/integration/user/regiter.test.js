import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../../src/app";
import factory from "../../factories";

import truncate from "../../util/truncate";

describe("Testes de criação de usuario", () => {
  let globalUser;

  beforeAll(async () => {
    await truncate();
  });

  test("Criar usuario", async () => {
    const user = await factory.attrs("User", {
      password: "123456",
    });

    globalUser = user;

    const response = await request(app)
      .post("/users")
      .send(user);

    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
    expect(response.body).toHaveProperty("is_teacher");
  });

  test("Criptografar senha de usuario antes de enviar ao banco de dados", async () => {
    const user = await factory.create("User", {
      password: "123456",
    });

    const compareHash = await bcrypt.compare("123456", user.password_hash);

    expect(compareHash).toBe(true);
  });

  test("Validação dos campos do corpo da requisição de criação de usuario", async () => {
    const invalidUser = () => {
      let { name, ...otherProps } = globalUser;
      return otherProps;
    };
    const response = await request(app)
      .post("/users")
      .send({
        incompleteUser: invalidUser,
      });

    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });

  test("Impedir que um usuario se cadastre com um email já cadastrado", async () => {
    const user = await factory.attrs("User", {
      email: globalUser.email,
    });

    const response = await request(app)
      .post("/users")
      .send(user);

    expect(response.body.error).toBe(
      "Este email já esta cadastrado para outro usuario"
    );
  });
});
