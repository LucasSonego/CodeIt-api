import request from "supertest";

import app from "../../../src/app";
import factory from "../../factories";
import truncate from "../../util/truncate";

describe("Testes listagem de respostas", () => {
  let teacher, student1, student2;
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
    language: "javascript",
  };

  beforeAll(async () => {
    await truncate();

    const [teacherData, student1Data, student2Data] = await Promise.all([
      factory.attrs("User", {
        is_teacher: true,
      }),
      factory.attrs("User", {
        is_teacher: false,
      }),
      factory.attrs("User", {
        is_teacher: false,
      }),
    ]);

    await Promise.all([
      request(app).post("/users").send(teacherData),
      request(app).post("/users").send(student1Data),
      request(app).post("/users").send(student2Data),
    ]);

    const [
      responseTeacher,
      responseStudent1,
      responseStudent2,
    ] = await Promise.all([
      request(app).post("/sessions").send({
        email: teacherData.email,
        password: teacherData.password,
      }),
      request(app).post("/sessions").send({
        email: student1Data.email,
        password: student1Data.password,
      }),
      request(app).post("/sessions").send({
        email: student2Data.email,
        password: student2Data.password,
      }),
    ]);

    teacher = {
      ...teacherData,
      token: responseTeacher.body.token,
    };

    student1 = {
      ...student1Data,
      token: responseStudent1.body.token,
    };

    student2 = {
      ...student2Data,
      token: responseStudent2.body.token,
    };

    await request(app)
      .post("/disciplines")
      .set("Authorization", "Bearer " + teacher.token)
      .send({
        ...discipline,
      });

    await Promise.all([
      request(app)
        .post(`/enrollments/${discipline.id}`)
        .set("Authorization", "Bearer " + student1.token),
      request(app)
        .post(`/enrollments/${discipline.id}`)
        .set("Authorization", "Bearer " + student2.token),
    ]);

    const taskResponse = await request(app)
      .post(`/tasks/${discipline.id}`)
      .set("Authorization", "Bearer " + teacher.token)
      .send({ ...task });

    task = { ...task, id: taskResponse.body.id };

    const answerResponse = await request(app)
      .post(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + student1.token)
      .send(answer);

    answer = { ...answer, id: answerResponse.body.id };
  });

  test("Listar todas as respostas de uma tarefa (professor)", async () => {
    const response = await request(app)
      .get(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + teacher.token);

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty("code");
    expect(response.body[0]).toHaveProperty("feedback");
    expect(response.body[0]).toHaveProperty("feedback_code");
    expect(response.body[0]).toHaveProperty("feedback_at");
    expect(response.body[0]).toHaveProperty("updated_at");
    expect(response.body[0]).toHaveProperty("accepted_at");
    expect(response.body[0]).toHaveProperty("student");
  });

  test("Buscar a resposta de uma tarefa (estudante)", async () => {
    const response = await request(app)
      .get(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + student1.token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("code");
    expect(response.body).toHaveProperty("feedback");
    expect(response.body).toHaveProperty("feedback_code");
    expect(response.body).toHaveProperty("accepted_at");
    expect(response.body).toHaveProperty("updated_at");
    expect(response.body).toHaveProperty("student");
  });

  test("Verificar se a tarefa existe", async () => {
    const response = await request(app)
      .get(`/answers/~invalid~`)
      .set("Authorization", "Bearer " + student1.token);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Não há nenhuma tarefa com este ID");
  });

  test("Verificar se o usuário enviou uma resposta para a tarefa", async () => {
    const response = await request(app)
      .get(`/answers/${task.id}`)
      .set("Authorization", "Bearer " + student2.token);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      "Você não enviou uma resposta para esta tarefa"
    );
  });

  test("Buscar resposta por id", async () => {
    const response = await request(app)
      .get(`/answers`)
      .query({ id: answer.id })
      .set("Authorization", "Bearer " + teacher.token);

    expect(response.body.code).toBe(answer.code);
    expect(response.body.language).toBe(answer.language);
    expect(response.body.task.id).toBe(task.id);
    expect(response.body.task.title).toBe(task.title);
    expect(response.body.task.description).toBe(task.description);
    expect(response.body.task.code).toBe(task.code);
    expect(response.body.task.discipline.id).toBe(discipline.id);
    expect(response.body.task.discipline.name).toBe(discipline.name);
    expect(response.body.task.discipline.teacher.id).toBe(teacher.id);
    expect(response.body.task.discipline.teacher.name).toBe(teacher.name);
    expect(response.body.task.discipline.teacher.email).toBe(teacher.email);
    expect(response.body.student.id).toBe(student1.id);
    expect(response.body.student.name).toBe(student1.name);
    expect(response.body.student.email).toBe(student1.email);
  });

  test("Validar se o usuário pode ver a resposta buscada", async () => {
    const response = await request(app)
      .get(`/answers`)
      .query({ id: answer.id })
      .set("Authorization", "Bearer " + student2.token);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      "A resposta so pode ser vista por seu autor e pelo professor que criou a tarefa"
    );
  });

  test("Verificar se a resposta buscada existe", async () => {
    const response = await request(app)
      .get(`/answers`)
      .query({ id: "~invalid~" })
      .set("Authorization", "Bearer " + student2.token);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Não há nenhuma reposta com este ID");
  });
});
