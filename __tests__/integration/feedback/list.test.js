import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes de listagem de feedbacks", () => {
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
    language: "javascript",
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

    await request(app)
      .put(`/feedback/${answer.id}`)
      .set("Authorization", "Bearer " + teacher.token)
      .send(feedback);
  });

  test("Listar todos os feedbacks das respostas enviadas por um estudante", async () => {
    const response = await request(app)
      .get("/feedback")
      .set("Authorization", "Bearer " + student.token);

    expect(response.status).toBe(200);
    expect(response.body[0].code).toBe(answer.code);
    expect(response.body[0].language).toBe(answer.language);
    expect(response.body[0].feedback_code).toBe(feedback.code);
    expect(response.body[0]).toHaveProperty("feedback_at");
    expect(response.body[0]).toHaveProperty("updated_at");
    expect(response.body[0]).toHaveProperty("feedback_at");
    expect(response.body[0].accepted_at).not.toBe(null);
    expect(response.body[0]).toHaveProperty("task");
    expect(response.body[0].task.id).toBe(task.id);
    expect(response.body[0].task.title).toBe(task.title);
    expect(response.body[0].task.description).toBe(task.description);
    expect(response.body[0].task.code).toBe(task.code);
    expect(response.body[0].task.id).toBe(task.id);
    expect(response.body[0].task.id).toBe(task.id);
    expect(response.body[0].task).toHaveProperty("discipline");
    expect(response.body[0].task.discipline.id).toBe(discipline.id);
    expect(response.body[0].task.discipline.name).toBe(discipline.name);
  });

  test("Listar todos os feedbacks enviados por um professor", async () => {
    const response = await request(app)
      .get("/feedback")
      .set("Authorization", "Bearer " + teacher.token);

    expect(response.status).toBe(200);
    expect(response.body[0].code).toBe(answer.code);
    expect(response.body[0].language).toBe(answer.language);
    expect(response.body[0].feedback_code).toBe(feedback.code);
    expect(response.body[0]).toHaveProperty("feedback_at");
    expect(response.body[0]).toHaveProperty("updated_at");
    expect(response.body[0]).toHaveProperty("feedback_at");
    expect(response.body[0].accepted_at).not.toBe(null);
    expect(response.body[0]).toHaveProperty("task");
    expect(response.body[0].task.id).toBe(task.id);
    expect(response.body[0].task.title).toBe(task.title);
    expect(response.body[0].task.description).toBe(task.description);
    expect(response.body[0].task.code).toBe(task.code);
    expect(response.body[0].task.id).toBe(task.id);
    expect(response.body[0].task.id).toBe(task.id);
    expect(response.body[0].task).toHaveProperty("discipline");
    expect(response.body[0].task.discipline.id).toBe(discipline.id);
    expect(response.body[0].task.discipline.name).toBe(discipline.name);
    expect(response.body[0].student.id).toBe(student.id);
    expect(response.body[0].student.name).toBe(student.name);
    expect(response.body[0].student.email).toBe(student.email);
  });
});
