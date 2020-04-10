import request from "supertest";
import app from "../../../src/app";
import factory from "../../factories";

import truncate from "../../util/truncate";

describe("Testes de listagem de usuarios", () => {
  let token;

  beforeAll(async () => {
    await truncate();

    for (let i = 1; i <= 4; i++) {
      const userData = await factory.attrs("User", {
        email: `testuser${i}@gmail.com`,
        password: "123456",
        is_teacher: i <= 2,
      });

      await request(app).post("/users").send(userData);
    }

    const response = await request(app).post("/sessions").send({
      email: "testuser1@gmail.com",
      password: "123456",
    });

    token = response.body.token;
  });

  test("Listar todos os usuarios", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "Bearer " + token);

    expect(response.body.length).toBe(3);
  });

  test("Listar apenas os professores", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "Bearer " + token)
      .query({ type: "teachers" });

    expect(response.body.length).toBe(1);
    expect(!!response.body[0].disciplines).toBe(true);
  });

  test("Listar apenas os estudantes", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "Bearer " + token)
      .query({ type: "students" });

    expect(response.body.length).toBe(2);
  });

  test("Validação de autenticação", async () => {
    const response = await request(app).get("/users");

    expect(response.body.error).toBe("Autenticação necessaria");
  });
});
