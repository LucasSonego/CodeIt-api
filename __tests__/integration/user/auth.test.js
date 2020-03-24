import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de validação de autenticação", () => {
  let token, user;

  beforeAll(async () => {
    await truncate();

    const userData = await factory.attrs("User");
    await request(app)
      .post("/users")
      .send(userData);

    user = userData;
    const response = await request(app)
      .post("/sessions")
      .send({
        email: userData.email,
        password: userData.password,
      });
    token = response.body.token;
  });

  test("Validação de autenticação (token correto)", async () => {
    const response = await request(app)
      .get("/user")
      .set("Authorization", "Bearer " + token);

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.id).toBe(user.id);
    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
    expect(response.body.is_teacher).toBe(user.is_teacher);
  });

  test("Validação de autenticação (token invalido)", async () => {
    const response = await request(app)
      .get("/user")
      .set("Authorization", "Bearer " + "~invalid token~");

    expect(response.body.error).toBe("Token invalido");
  });

  test("Validação de autenticação (sem token)", async () => {
    const response = await request(app).get("/user");

    expect(response.body.error).toBe("Autenticação necessaria");
  });
});
