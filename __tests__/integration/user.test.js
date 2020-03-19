import request from "supertest";
import app from "../../src/app";

describe("Teste dos sistemas de Usuario e Sessão", () => {
  /**
   * Variaveis que serão obtidas durante algum teste e utilizadas em outros
   */
  let token;

  test("Cadastrar um novo usuario", async () => {
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

  test("Validação dos campos do corpo da requisição de criação de usuario", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        name: "Test User",
        password: "123456",
      });

    expect(response.body).toHaveProperty("error");
  });

  test("Impedir que um usuario se cadastre com um email já cadastrado", async () => {
    await request(app)
      .post("/users")
      .send({
        name: "Test User",
        email: "testmail@gmail.com",
        password: "123456",
        is_teacher: true,
      });

    const response = await request(app)
      .post("/users")
      .send({
        name: "Test User 2",
        email: "testmail@gmail.com",
        password: "654321",
      });

    expect(response.body).toHaveProperty("error");
  });

  test("Fazer login", async () => {
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

  test("Impedir login quando os dados enviados são invalidos", async () => {
    const response = await request(app)
      .post("/sessions")
      .send({
        email: "testmail@gmail.com",
        password: "654321",
      });

    expect(response.body).toHaveProperty("error");
  });

  test("Validação de autenticação (token correto)", async () => {
    const response = await request(app)
      .get("/tests")
      .set("Authorization", "Bearer " + token);

    expect(response.body).toHaveProperty("id");
  });

  test("Validação de autenticação (token invalido)", async () => {
    const response = await request(app)
      .get("/tests")
      .set("Authorization", "Bearer " + "~token invalido~");

    expect(response.body).toHaveProperty("error");
  });

  test("Validação de autenticação (sem token)", async () => {
    const response = await request(app).get("/tests");

    expect(response.body).toHaveProperty("error");
  });

  test("Editar usuario", async () => {
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        name: "Test User 2",
        email: "testmail2@gmail.com",
        oldPassword: "123456",
        password: "654321",
        is_teacher: false,
      });

    expect(response.body).toHaveProperty("id", "name", "email", "is_teacher");
  });

  test("Validação dos campos da requisição", async () => {
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        name: "Test User 3",
        email: "~not an email~",
        oldPassword: "123456",
        password: "654321",
        is_teacher: false,
      });

    expect(response.body).toHaveProperty("error");
  });

  test("Validação de autenticação", async () => {
    const response = await request(app)
      .put("/users")
      .send({
        name: "Test User 2",
        email: "testmail2@gmail.com",
        is_teacher: false,
      });

    expect(response.body).toHaveProperty("error");
  });

  test("Verificar se já existe um usuario com o novo email enviado", async () => {
    await request(app)
      .post("/users")
      .send({
        name: "Another Test User",
        email: "testmail3@gmail.com",
        password: "123456",
        is_teacher: false,
      });
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        email: "testmail3@gmail.com",
      });

    expect(response.body).toHaveProperty("error");
  });

  test("Verificar se a senha antiga foi enviada na requisição", async () => {
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        // oldPassword: "123456",
        password: "654321",
      });

    expect(response.body).toHaveProperty("error");
  });

  test("Verificar se a senha antiga está correta", async () => {
    const response = await request(app)
      .put("/users")
      .set("Authorization", "Bearer " + token)
      .send({
        oldPassword: "~senha incorreta~",
        password: "654321",
      });

    expect(response.body).toHaveProperty("error");
  });
});
