import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de remoção de disciplina", () => {
  let teacher1, teacher2, student;
  let discipline1 = {
    id: "2020DEE123",
    name: "Testing The Code",
  };

  let discipline2 = {
    id: "2020DEE321",
    name: "Testing The Code even more",
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

    await Promise.all([
      request(app)
        .post("/disciplines")
        .set("Authorization", "Bearer " + teacher1.token)
        .send({
          ...discipline1,
        }),
      request(app)
        .post("/disciplines")
        .set("Authorization", "Bearer " + teacher1.token)
        .send({
          ...discipline2,
        }),
    ]);
  });

  test("Deletar disciplina", async () => {
    const response = await request(app)
      .delete(`/disciplines/${discipline1.id}`)
      .set("Authorization", "Bearer " + teacher1.token);

    expect(response.body).not.toHaveProperty("error");
    expect(response.status).toBe(200);
  });

  test("Validação de permissão para deletar disciplina", async () => {
    const response = await request(app)
      .delete(`/disciplines/${discipline2.id}`)
      .set("Authorization", "Bearer " + teacher2.token);

    expect(response.body).toHaveProperty("error");
    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "Você não tem permissão para fazer alterações nesta disciplina"
    );
  });

  test("Validação de código de disciplina", async () => {
    const response = await request(app)
      .delete(`/disciplines/000`)
      .set("Authorization", "Bearer " + teacher1.token);

    expect(response.body).toHaveProperty("error");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "Não há nenhuma disciplina cadastrada com este código"
    );
  });
});
