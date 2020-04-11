import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de busca e listagem de disciplinas", () => {
  let teacher1, teacher2, student;
  let discipline = {
    id: "2020DEE123",
    name: "Testing The Code",
  };

  beforeAll(async () => {
    await truncate();

    let teacher1Data = await factory.attrs("User", {
      is_teacher: true,
    });

    let teacher2Data = await factory.attrs("User", {
      is_teacher: true,
    });

    let studentData = await factory.attrs("User", {
      is_teacher: false,
    });

    await Promise.all([
      request(app).post("/users").send(teacher1Data),
      request(app).post("/users").send(teacher2Data),
      request(app).post("/users").send(studentData),
    ]);

    const [
      responseTeacher1,
      responseTeacher2,
      responseStudent,
    ] = await Promise.all([
      request(app).post("/sessions").send({
        email: teacher1Data.email,
        password: teacher1Data.password,
      }),
      request(app).post("/sessions").send({
        email: teacher2Data.email,
        password: teacher2Data.password,
      }),
      request(app).post("/sessions").send({
        email: studentData.email,
        password: studentData.password,
      }),
    ]);

    teacher1 = {
      ...teacher1Data,
      token: responseTeacher1.body.token,
    };
    teacher2 = {
      ...teacher2Data,
      token: responseTeacher2.body.token,
    };
    student = {
      ...studentData,
      token: responseStudent.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher1.token)
      .send({
        ...discipline,
      });
  });

  test("Alterar o nome de uma disciplina", async () => {
    const response = await request(app)
      .put("/disciplines")
      .set("Authorization", "Bearer " + teacher1.token)
      .send({
        id: discipline.id,
        name: "New name",
      });

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.name).toBe("New name");
  });

  test("Validação do professor para alterar dados da disciplina", async () => {
    const response = await request(app)
      .put("/disciplines")
      .set("Authorization", "Bearer " + teacher2.token)
      .send({
        id: discipline.id,
        name: "New name",
      });

    expect(response.body).toHaveProperty("error");
    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "Você não tem permissão para fazer alterações nesta disciplina"
    );
  });

  test("Transferir disciplina para outro professor", async () => {
    const response = await request(app)
      .put("/disciplines")
      .set("Authorization", "Bearer " + teacher1.token)
      .send({
        id: discipline.id,
        newTeacher: teacher2.id,
      });

    expect(response.body.teacher.id).toBe(teacher2.id);
  });

  test("Validação de tipo de usuario ao transferir disciplina para outro professor", async () => {
    const response = await request(app)
      .put("/disciplines")
      .set("Authorization", "Bearer " + teacher2.token)
      .send({
        id: discipline.id,
        newTeacher: student.id,
      });

    expect(response.body).toHaveProperty("error");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "O usuário inserido não existe ou não é um professor"
    );
  });
});
