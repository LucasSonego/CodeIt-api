import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de reabertura de tarefas", () => {
  let teacher1, teacher2;
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

    const [responseTeacher1, responseTeacher2] = await Promise.all([
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
      token: responseTeacher2.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher1.token)
      .send({
        ...discipline,
      });

    const taskResponse = await request(app)
      .post("/tasks")
      .set("Authorization", "Bearer " + teacher1.token)
      .send({ ...task });

    task = { ...task, id: taskResponse.body.id };

    await request(app)
      .delete(`/tasks/${task.id}`)
      .set("Authorization", "Bearer " + teacher1.token);
  });

  test("Reabrir uma tarefa", async () => {
    const response = await request(app)
      .patch(`/tasks/${task.id}`)
      .set("Authorization", "Bearer " + teacher1.token);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Tarefa reaberta com sucesso");
  });

  test("Validação de tarefa", async () => {
    const response = await request(app)
      .patch(`/tasks/~invalid~`)
      .set("Authorization", "Bearer " + teacher1.token);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Não há nenhuma tarefa com este id");
  });

  test("Validação de permissão de alteração de tarefa", async () => {
    const response = await request(app)
      .patch(`/tasks/${task.id}`)
      .set("Authorization", "Bearer " + teacher2.token);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(
      "Você não tem permissão para fazer alterações nas atividades desta disciplina"
    );
  });
});
