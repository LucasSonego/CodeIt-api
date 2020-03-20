import request from "supertest";
import app from "../../../src/app";
import factory from "../../factories";

import truncate from "../../util/truncate";

describe("Testes de Login e Autenticação", () => {
  let userData, user;

  beforeAll(async () => {
    await truncate();

    userData = await factory.attrs("User");
    const response = await request(app)
      .post("/users")
      .send(userData);

    user = response.body;
  });

  test("Login", async () => {
    const { email, password } = userData;

    const response = await request(app)
      .post("/sessions")
      .send({
        email,
        password,
      });
    expect(response.body).toHaveProperty("user", "id", "name", "email");
    expect(response.body.user.id).toBe(user.id);
    expect(response.body.user.name).toBe(user.name);
    expect(response.body.user.email).toBe(user.email);
    expect(response.body).toHaveProperty("token");
  });

  test("Tentar logar com dados invalidos", async () => {
    const { email } = userData;
    const response = await request(app)
      .post("/sessions")
      .send({
        email,
        password: "~senha incorreta~",
      });

    expect(response.body.error).toBe("Usuario ou senha inválidos");
  });

  test("Validação dos campos da requisição", async () => {
    const { email } = userData;
    const response = await request(app)
      .post("/sessions")
      .send({
        email,
      });

    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });
});
