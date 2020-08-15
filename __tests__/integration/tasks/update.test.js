import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de alteração de tarefas", () => {
  let teacher1, teacher2;
  let discipline = {
    id: "2020DEE123",
    name: "Testing The Code",
  };
  let task = {
    title: "Mussum Ipsum, cacilds vidis litro abertis.",
    description:
      "Quem manda na minha terra sou euzis! Suco de cevadiss, é um leite divinis, qui tem lupuliz, matis, aguis e fermentis. Em pé sem cair, deitado sem dormir, sentado sem cochilar e fazendo pose.",
    code: "function sucoDeCevadiss(){}",
  };

  beforeAll(async () => {
    await truncate();
    let teacher1Data = await factory.attrs("User", {
      is_teacher: true,
    });

    let teacher2Data = await factory.attrs("User", {
      is_teacher: true,
    });

    await Promise.all([
      request(app).post("/users").send(teacher1Data),
      request(app).post("/users").send(teacher2Data),
    ]);

    const [responseTeacher1, responseStudent] = await Promise.all([
      request(app).post("/sessions").send({
        email: teacher1Data.email,
        password: teacher1Data.password,
      }),
      request(app).post("/sessions").send({
        email: teacher2Data.email,
        password: teacher2Data.password,
      }),
    ]);

    teacher1 = {
      ...teacher1Data,
      token: responseTeacher1.body.token,
    };
    teacher2 = {
      ...teacher2Data,
      token: responseStudent.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher1.token)
      .send({
        ...discipline,
      });

    const taskResponse = await request(app)
      .post(`/tasks/${discipline.id}`)
      .set("Authorization", "Bearer " + teacher1.token)
      .send({ ...task });

    task = { ...task, id: taskResponse.body.id };
  });

  test("Alterar uma tarefa", async () => {
    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .set("Authorization", "Bearer " + teacher1.token)
      .send({ ...task, title: "Update test" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.discipline.id).toBe(discipline.id);
    expect(response.body.discipline.name).toBe(discipline.name);
    expect(response.body.discipline.teacher.id).toBe(teacher1.id);
    expect(response.body.discipline.teacher.name).toBe(teacher1.name);
    expect(response.body.discipline.teacher.email).toBe(teacher1.email);
    expect(response.body.title).toBe("Update test");
    expect(response.body.description).toBe(task.description);
    expect(response.body.code).toBe(task.code);
    expect(response.body.language).toBe(null);
  });

  test("Validação dos campos da requisição", async () => {
    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .set("Authorization", "Bearer " + teacher1.token)
      .send({
        title: task.title,
        description: null,
        code: task.code,
        language: task.language,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });

  test("Verificar se há algo a ser alterado", async () => {
    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .set("Authorization", "Bearer " + teacher1.token)
      .send({ anything: "asdadsa" });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Não há nada a ser alterado");
  });

  test("Validação de tarefa", async () => {
    const response = await request(app)
      .put(`/tasks/~invalid~`)
      .set("Authorization", "Bearer " + teacher1.token)
      .send({ ...task });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Não há nenhuma tarefa com este id");
  });

  test("Validação de permissão de alteração de tarefa", async () => {
    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .set("Authorization", "Bearer " + teacher2.token)
      .send({ ...task, title: "Update test" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Você não tem permissão para fazer alterações nas atividades desta disciplina"
    );
  });
});
