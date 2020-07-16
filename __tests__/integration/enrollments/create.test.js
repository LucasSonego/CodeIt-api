import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de matriculas/inscrições", () => {
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

    let studentData = await factory.attrs("User", {
      is_teacher: false,
    });

    await Promise.all([
      request(app).post("/users").send(teacherData),
      request(app).post("/users").send(studentData),
    ]);

    const [responseTeacher1, responseStudent] = await Promise.all([
      request(app).post("/sessions").send({
        email: teacherData.email,
        password: teacherData.password,
      }),
      request(app).post("/sessions").send({
        email: studentData.email,
        password: studentData.password,
      }),
    ]);

    teacher = {
      ...teacherData,
      token: responseTeacher1.body.token,
    };
    student = {
      ...studentData,
      token: responseStudent.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher.token)
      .send({
        ...discipline,
      });
  });

  test("Efetuar matrícula", async () => {
    const response = await request(app)
      .post(`/enrollments/${discipline.id}`)
      .set("Authorization", "Bearer " + student.token);

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.discipline_id).toBe(discipline.id);
    expect(response.body.student_id).toBe(student.id);
  });

  test("Tentar se matricular em uma disciplina a qual ja está matriculado", async () => {
    const response = await request(app)
      .post(`/enrollments/${discipline.id}`)
      .set("Authorization", "Bearer " + student.token);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Você já está matriculado nesta disciplina"
    );
  });

  test("Tentar se matricular em uma disciplina que não existe", async () => {
    const response = await request(app)
      .post(`/enrollments/0000000`)
      .set("Authorization", "Bearer " + student.token);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Não há nenhuma disciplina cadastrada com este código"
    );
  });
});
