import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes na criação disciplinas", () => {
  let teacher, student;
  let discipline = {
    id: "2020DEE123",
    name: "Testing The Code",
  };

  beforeAll(async () => {
    await truncate();

    let teacherData = await factory.attrs("User", {
      is_teacher: true,
    });
    await request(app).post("/users").send(teacherData);

    let response;
    response = await request(app).post("/sessions").send({
      email: teacherData.email,
      password: teacherData.password,
    });
    teacher = {
      ...teacherData,
      token: response.body.token,
    };

    let studentData = await factory.attrs("User", {
      is_teacher: false,
    });
    await request(app).post("/users").send(studentData);

    response = await request(app).post("/sessions").send({
      email: studentData.email,
      password: studentData.password,
    });
    student = {
      ...studentData,
      token: response.body.token,
    };
  });

  test("Criar disciplina", async () => {
    const response = await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher.token)
      .send({
        ...discipline,
      });

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.id).toBe(discipline.id);
    expect(response.body.name).toBe(discipline.name);
    expect(response.body.teacher.id).toBe(teacher.id);
    expect(response.body.teacher.name).toBe(teacher.name);
    expect(response.body.teacher.email).toBe(teacher.email);
  });

  test("Validação dos campos da requisição", async () => {
    const response = await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + student.token)
      .send({
        id: discipline.id,
        // name: ?
      });

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });

  test("Validação de tipo de usuário", async () => {
    const response = await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + student.token)
      .send({
        ...discipline,
      });

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Apenas professores podem criar disciplinas"
    );
  });

  test("Validação de autenticação", async () => {
    const response = await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + "~invalid token~")
      .send({
        ...discipline,
      });

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Token invalido");
  });

  test("Verificação de código de disciplina que já existe", async () => {
    const response = await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher.token)
      .send({
        ...discipline,
      });

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Já existe uma disciplina cadastrada com este código"
    );
  });
});
