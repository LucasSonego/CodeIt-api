import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de listagem de estudantes matriculados em uma disciplina", () => {
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

    await request(app)
      .post(`/enrollments/${discipline.id}`)
      .set("Authorization", "Bearer " + student.token);
  });

  test("Remover matricula", async () => {
    const response = await request(app)
      .delete(`/enrollments/${discipline.id}`)
      .set("Authorization", "Bearer " + student.token);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Matrícula removida");
  });

  test("Validação de existencia da matricula a ser removida", async () => {
    const response = await request(app)
      .delete("/enrollments/~invalid discipline~")
      .set("Authorization", "Bearer " + teacher.token);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Você não está matriculado em uma disciplina com este código"
    );
  });
});
