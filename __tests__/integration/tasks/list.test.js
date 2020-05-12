import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de listagem de tarefas", () => {
  let teacher;
  let discipline = {
    id: "2020DEE123",
    name: "Testing The Code",
  };
  let task = {
    discipline_id: discipline.id,
    title: "Mussum Ipsum, cacilds vidis litro abertis.",
    description:
      "Quem manda na minha terra sou euzis! Suco de cevadiss, é um leite divinis, qui tem lupuliz, matis, aguis e fermentis. Em pé sem cair, deitado sem dormir, sentado sem cochilar e fazendo pose.",
    code: "function sucoDeCevadiss(){}",
  };

  let closedTask = { ...task };

  beforeAll(async () => {
    await truncate();
    let teacherData = await factory.attrs("User", {
      is_teacher: true,
    });

    await request(app).post("/users").send(teacherData);

    const responseTeacher = await request(app).post("/sessions").send({
      email: teacherData.email,
      password: teacherData.password,
    });

    teacher = {
      ...teacherData,
      token: responseTeacher.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher.token)
      .send({
        ...discipline,
      });

    const [taskResponse, closedTaskResponse] = await Promise.all([
      request(app)
        .post("/tasks")
        .set("Authorization", "Bearer " + teacher.token)
        .send({ ...task }),
      request(app)
        .post("/tasks")
        .set("Authorization", "Bearer " + teacher.token)
        .send({ ...closedTask }),
    ]);

    task = { ...task, id: taskResponse.body.id };
    closedTask = { ...task, id: closedTaskResponse.body.id };

    await request(app)
      .delete(`/tasks/${closedTask.id}`)
      .set("Authorization", "Bearer " + teacher.token);
  });

  test("Listar toda as tarefas de uma disciplina", async () => {
    const response = await request(app)
      .get("/tasks/")
      .set("Authorization", "Bearer " + teacher.token)
      .query({ discipline: discipline.id });

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
});
