import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de alteração de respostas", () => {
  let teacher, student;
  let discipline = {
    id: "2020DEE123",
    name: "Testing The Code",
  };
  let task = {
    title: "Mussum Ipsum, cacilds vidis litro abertis.",
    description:
      "Suco de cevadiss, é um leite divinis, qui tem lupuliz, matis, aguis e fermentis.",
    code: "function sucoDeCevadiss(){}",
  };

  let answer = {
    code: "function testing()",
  };

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

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher.token)
      .send({
        ...discipline,
      });

    await request(app)
      .post(`/enrollments/${discipline.id}`)
      .set("Authorization", "Bearer " + student.token);

    const taskResponse = await request(app)
      .post(`/tasks/${discipline.id}`)
      .set("Authorization", "Bearer " + teacher.token)
      .send({ ...task });

    task = { ...task, id: taskResponse.body.id };

    const answerResponse = await request(app)
      .post(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + student.token)
      .send(answer);

    answer = { ...answer, id: answerResponse.body.id };
  });

  test("Alterar uma resposta de uma tarefa", async () => {
    const response = await request(app)
      .put(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + student.token)
      .send({
        code: "function updating()",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.task.id).toBe(task.id);
    expect(response.body.task.title).toBe(task.title);
    expect(response.body.task.description).toBe(task.description);
    expect(response.body.task.code).toBe(task.code);
    expect(response.body.code).toBe("function updating()");
  });

  test("Validação dos campos da requisição", async () => {
    const response = await request(app)
      .put(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + student.token);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });

  test("Verificar se uma resposta já foi enviada por este usuário", async () => {
    const response = await request(app)
      .put("/answers/~invalid~")
      .set("Authorization", "Bearer " + student.token)
      .send({
        code: "function testing()",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "Não há uma resposta sua para esta tarefa"
    );
  });

  test("Verificar se o a resposta já foi aceita", async () => {
    await request(app)
      .put(`/feedback/${answer.id}`)
      .set("Authorization", "Bearer " + teacher.token)
      .send({ accepted: true });

    const response = await request(app)
      .put(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + student.token)
      .send({
        code: "function updating()",
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "Você não pode alterar uma resposta que já foi aceita"
    );
  });
});
