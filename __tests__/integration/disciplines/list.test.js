import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de busca e listagem de disciplinas", () => {
  let teacher1, teacher2, student;
  let discipline1 = {
    id: "2020DEE123",
    name: "Testing The Code",
  };

  let discipline2 = {
    id: "2020DEE321",
    name: "Testing The Code 2",
  };

  beforeAll(async () => {
    await truncate();

    const [teacher1Data, teacher2Data, studentData] = await Promise.all([
      factory.attrs("User", {
        is_teacher: true,
      }),
      factory.attrs("User", {
        is_teacher: true,
      }),
      factory.attrs("User", {
        is_teacher: false,
      }),
    ]);

    await Promise.all([
      request(app).post("/users").send(teacher1Data),
      request(app).post("/users").send(teacher2Data),
      request(app).post("/users").send(studentData),
    ]);

    const [
      teacher1Response,
      teacher2Response,
      studentResponse,
    ] = await Promise.all([
      await request(app).post("/sessions").send({
        email: teacher1Data.email,
        password: teacher1Data.password,
      }),
      await request(app).post("/sessions").send({
        email: teacher2Data.email,
        password: teacher2Data.password,
      }),
      await request(app).post("/sessions").send({
        email: studentData.email,
        password: studentData.password,
      }),
    ]);

    teacher1 = {
      ...teacher1Data,
      token: teacher1Response.body.token,
    };
    teacher2 = {
      ...teacher2Data,
      token: teacher2Response.body.token,
    };
    student = {
      ...studentResponse,
      token: studentResponse.body.token,
    };

    await Promise.all([
      request(app)
        .post("/disciplines")
        .set("Authorization", "Bearer " + teacher1.token)
        .send(discipline1),
      request(app)
        .post("/disciplines")
        .set("Authorization", "Bearer " + teacher2.token)
        .send(discipline2),
    ]);

    await request(app)
      .post(`/enrollments/${discipline1.id}`)
      .set("Authorization", "Bearer " + student.token);
  });

  test("Listar todas as disciplinas que o usuário está matriculado e as outras disciplinas", async () => {
    const response = await request(app)
      .get("/disciplines")
      .set("Authorization", "Bearer " + student.token);

    expect(response.body).not.toHaveProperty("error");
    expect(response.body).toHaveProperty("enrolled_disciplines");
    expect(response.body.enrolled_disciplines.length).toBe(1);
    expect(response.body).toHaveProperty("disciplines");
    expect(response.body.disciplines.length).toBe(1);
  });

  test("Busca por id da disciplina (professor vinculado à disciplina)", async () => {
    const response = await request(app)
      .get("/disciplines")
      .set("Authorization", "Bearer " + teacher1.token)
      .query({ id: discipline1.id });

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.id).toBe(discipline1.id);
    expect(response.body.name).toBe(discipline1.name);
    expect(response.body.teacher.id).toBe(teacher1.id);
    expect(response.body.teacher.name).toBe(teacher1.name);
    expect(response.body.teacher.email).toBe(teacher1.email);
    expect(response.body).toHaveProperty("enrollments");
    expect(response.body).toHaveProperty("tasks");
  });

  test("Busca por id da disciplina (estudante)", async () => {
    const response = await request(app)
      .get("/disciplines")
      .set("Authorization", "Bearer " + student.token)
      .query({ id: discipline1.id });

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.id).toBe(discipline1.id);
    expect(response.body.name).toBe(discipline1.name);
    expect(response.body.teacher.id).toBe(teacher1.id);
    expect(response.body.teacher.name).toBe(teacher1.name);
    expect(response.body.teacher.email).toBe(teacher1.email);
  });

  test("Buscar disciplinas de um professor especifico", async () => {
    const response = await request(app)
      .get("/disciplines")
      .set("Authorization", "Bearer " + student.token)
      .query({ teacher: teacher1.id });

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(discipline1.id);
    expect(response.body[0].name).toBe(discipline1.name);
    expect(response.body[0].teacher.id).toBe(teacher1.id);
    expect(response.body[0].teacher.name).toBe(teacher1.name);
    expect(response.body[0].teacher.email).toBe(teacher1.email);
  });
});
