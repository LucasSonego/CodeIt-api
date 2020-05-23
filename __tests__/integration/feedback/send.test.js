import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de envio de feedback", () => {
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
    code: "function test()",
  };

  let feedback = {
    feedback: "Nice",
    code: "function test(feedback)",
    accepted: true,
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

  test("Enviar um feedback para uma resposta", async () => {
    const response = await request(app)
      .put(`/feedback/${answer.id}`)
      .set("Authorization", "Bearer " + teacher.token)
      .send(feedback);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(answer.id);
    expect(response.body.code).toBe(answer.code);
    expect(response.body.feedback).toBe(feedback.feedback);
    expect(response.body.feedback_code).toBe(feedback.code);
    expect(!!response.body.accepted_at).toBe(feedback.accepted);
  });

  test("Vereficar se a tarefa existe", async () => {
    const response = await request(app)
      .put(`/feedback/~invalid~`)
      .set("Authorization", "Bearer " + teacher.token)
      .send(feedback);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Não há nenhuma resposta com este ID");
  });

  test("Verificar se o autor da requisição é o professor da disciplina que a tarefa está vinculada", async () => {
    const response = await request(app)
      .put(`/feedback/${answer.id}`)
      .set("Authorization", "Bearer " + student.token)
      .send(feedback);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      "Você não tem premissão para dar feedback para as tarefas desta disciplina"
    );
  });

  test("Validação dos campos da requisição", async () => {
    const response = await request(app)
      .put(`/feedback/${answer.id}`)
      .set("Authorization", "Bearer " + teacher.token)
      .send({
        accepted: "yes",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Um ou mais campos não foram preenchidos corretamente"
    );
  });
});
