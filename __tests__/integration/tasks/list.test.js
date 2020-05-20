import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de listagem de tarefas", () => {
  let teacher, student;
  let discipline1 = {
    id: "2020DEE123",
    name: "Testing The Code",
  };
  let discipline2 = {
    id: "2020DEE321",
    name: "Testing The Code",
  };
  let task = {
    title: "Mussum Ipsum, cacilds vidis litro abertis.",
    description:
      "Quem manda na minha terra sou euzis! Suco de cevadiss, é um leite divinis, qui tem lupuliz, matis, aguis e fermentis. Em pé sem cair, deitado sem dormir, sentado sem cochilar e fazendo pose.",
    code: "function sucoDeCevadiss(){}",
  };
  let task2;

  let closedTask = { ...task };

  beforeAll(async () => {
    await truncate();
    const [teacherData, studentData] = await Promise.all([
      factory.attrs("User", {
        is_teacher: true,
      }),
      factory.attrs("User", {
        is_teacher: false,
      }),
    ]);

    await Promise.all([
      request(app).post("/users").send(teacherData),
      request(app).post("/users").send(studentData),
    ]);

    const [responseTeacher, responseStudent] = await Promise.all([
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
      token: responseTeacher.body.token,
    };

    student = {
      ...studentData,
      token: responseStudent.body.token,
    };

    await Promise.all([
      request(app)
        .post("/disciplines")
        .set("Authorization", "Bearer " + teacher.token)
        .send({
          ...discipline1,
        }),
      request(app)
        .post("/disciplines")
        .set("Authorization", "Bearer " + teacher.token)
        .send({
          ...discipline2,
        }),
    ]);

    await Promise.all([
      request(app)
        .post(`/enrollments/${discipline1.id}`)
        .set("Authorization", "Bearer " + student.token),
      request(app)
        .post(`/enrollments/${discipline2.id}`)
        .set("Authorization", "Bearer " + student.token),
    ]);

    const [taskResponse, closedTaskResponse, task2Response] = await Promise.all(
      [
        request(app)
          .post(`/tasks/${discipline1.id}`)
          .set("Authorization", "Bearer " + teacher.token)
          .send({ ...task }),
        request(app)
          .post(`/tasks/${discipline1.id}`)
          .set("Authorization", "Bearer " + teacher.token)
          .send({ ...closedTask }),
        request(app)
          .post(`/tasks/${discipline2.id}`)
          .set("Authorization", "Bearer " + teacher.token)
          .send({ ...task }),
      ]
    );

    task = { ...task, id: taskResponse.body.id };
    closedTask = { ...task, id: closedTaskResponse.body.id };
    task2 = { ...task, id: task2Response.body.id };

    await request(app)
      .delete(`/tasks/${closedTask.id}`)
      .set("Authorization", "Bearer " + teacher.token);
  });

  test("Listar toda as tarefas de uma disciplina", async () => {
    const response = await request(app)
      .get("/tasks/")
      .set("Authorization", "Bearer " + teacher.token)
      .query({ discipline: discipline1.id });

    expect(response.body.open[0].id).toBe(task.id);
    expect(response.body.closed[0].id).toBe(closedTask.id);
  });

  test("Validação de disciplina", async () => {
    const response = await request(app)
      .get("/tasks/")
      .set("Authorization", "Bearer " + teacher.token)
      .query({ discipline: "~invalid~" });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "Não há nenhuma disciplina cadastrada com este código"
    );
  });

  test("Listar todas as tarefas das disciplinas que um usuario está matriculado", async () => {
    const response = await request(app)
      .get("/tasks/")
      .set("Authorization", "Bearer " + student.token);

    expect(response.body.length).toBe(2);
    expect(response.body[0].id).toBe(discipline1.id);
    expect(response.body[0].name).toBe(discipline1.name);
    expect(response.body[0].tasks.length).toBe(2);
    expect(response.body[1].tasks.length).toBe(1);
    expect(response.body[1].id).toBe(discipline2.id);
    expect(response.body[1].name).toBe(discipline2.name);
  });
});
