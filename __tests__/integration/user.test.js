import request from "supertest";
import app from "../../src/app";

describe("Teste dos sistemas de Usuario e Sessão", () => {
  /**
   * Variaveis que serão obtidas durante algum teste e utilizadas em outros
   */
  let token;

  it("Cadastrar um novo usuario", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        name: "Test User",
        email: "testmail@gmail.com",
        password: "123456",
        is_teacher: true,
      });
    expect(response.body).toHaveProperty("id", "name", "email", "is_teacher");
  });

  it("Fazer login", async () => {
    const response = await request(app)
      .post("/sessions")
      .send({
        email: "testmail@gmail.com",
        password: "123456",
      });

    expect(response.body).toHaveProperty("user", "id", "name", "email");
    expect(response.body).toHaveProperty("token");
    token = response.body.token;
  });

  it("Impedir login quando os dados enviados são invalidos", async () => {
    const response = await request(app)
      .post("/sessions")
      .send({
        email: "testmail@gmail.com",
        password: "654321",
      });

    expect(response.body).toHaveProperty("error");
  });

  it("Validação de autenticação (token correto)", async () => {
    const response = await request(app)
      .get("/tests")
      .set("Authorization", "Bearer " + token);

    expect(response.body).toHaveProperty("id");
  });

  it("Validação de autenticação (token invalido)", async () => {
    const response = await request(app)
      .get("/tests")
      .set("Authorization", "Bearer " + "~token invalido~");

    expect(response.body).toHaveProperty("error");
  });

  it("Validação de autenticação (sem token)", async () => {
    const response = await request(app).get("/tests");

    expect(response.body).toHaveProperty("error");
  });
});
