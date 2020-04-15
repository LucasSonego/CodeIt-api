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

    let teacher1Data = await factory.attrs("User", {
      is_teacher: true,
    });
    await request(app).post("/users").send(teacher1Data);

    let response;
    response = await request(app).post("/sessions").send({
      email: teacher1Data.email,
      password: teacher1Data.password,
    });
    teacher1 = {
      ...teacher1Data,
      token: response.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher1.token)
      .send(discipline1);

    let teacher2Data = await factory.attrs("User", {
      is_teacher: true,
    });
    await request(app).post("/users").send(teacher2Data);

    response = await request(app).post("/sessions").send({
      email: teacher2Data.email,
      password: teacher2Data.password,
    });
    teacher2 = {
      ...teacher2Data,
      token: response.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher2.token)
      .send(discipline2);

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

  test("Listar todas as disciplinas", async () => {
    const response = await request(app)
      .get("/disciplines")
      .set("Authorization", "Bearer " + student.token);

    expect(response.body).not.toHaveProperty("error");
    expect(response.body.length).toBe(2);
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
