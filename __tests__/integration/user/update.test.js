import request from "supertest";
import app from "../../../src/app";
import factory from "../../factories";

import truncate from "../../util/truncate";

describe("Testes de update de informaçẽos do usuario", () => {
  let userData, user, token;

  beforeAll(async () => {
    await truncate();

    userData = await factory.attrs("User");

    const response = await request(app)
      .post("/users")
      .send(userData);

    user = response.body;

    const { email, password } = userData;
    const loginResponse = await request(app)
      .post("/sessions")
      .send({
        email,
        password,
      });

    token = loginResponse.body.token;
  });

  test("Editar usuario", async () => {
    const { name, email, password, is_teacher } = await factory.attrs("User");
    const oldPassword = userData.password;

    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        name,
        email,
        oldPassword,
        password,
        is_teacher,
      });

    expect(response.body.id).toBe(user.id);
    expect(response.body.name).toBe(name);
    expect(response.body.email).toBe(email);
    expect(response.body.is_teacher).toBe(is_teacher);
  });

  test("Validação dos campos da requisição", async () => {
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        email: "~not an email~",
      });

    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });

  test("Validação de autenticação", async () => {
    const response = await request(app)
      .put("/users")
      .send({});

    expect(response.body.error).toBe("Autenticação necessaria");
  });

  test("Verificar se já existe um usuario com o novo email enviado", async () => {
    const extraUserData = await factory.attrs("User", {
      email: "testmail@gmail.com",
    });

    await request(app)
      .post("/users")
      .send(extraUserData);

    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        email: extraUserData.email,
      });

    expect(response.body.error).toBe(
      "Este email já esta cadastrado para outro usuario"
    );
  });

  test("Verificar se a senha antiga foi enviada na requisição", async () => {
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        password: "123456",
      });
    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });

  test("Verificar se a senha antiga está correta", async () => {
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        oldPassword: "~senha incorreta~",
        password: "123456",
      });

    expect(response.body.error).toBe("Senha antiga incorreta");
  });
});
