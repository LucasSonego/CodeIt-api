# Documentação CodeIt API

### Sumario:

- [Usuários](#Usuários)
  - [Cadastro](#Cadastro-de-usuário)
  - [Login](#Login)
  - [Validação de autenticação](#Validação-de-autenticação)
  - [Editar Dados](#Editar-dados)
  - [Listar](#Listar)
- [Disciplinas](#Disciplinas)
  - [Criar](#Criar-disciplina)
  - [Editar](#Editar-disciplina)
  - [Listar](#Listar-disciplinas)
  - [Deletar](#Deletar-disciplina)
- [Matrículas](#Matrículas)
  - [Efetuar matrícula](#Efetuar-matrícula)
  - [Remover matrícula](#Remover-matrícula)
- [Tarefas](#Tarefas)
  - [Criar](#Criar-tarefa)
  - [Editar](#Editar-tarefa)
  - [Listar](#Listar-tarefas)
  - [Fechar](#Fechar-tarefa-não-aceitar-mais-respostas)
  - [Reabrir](#Reabrir-tarefa-voltar-a-aceitar-respostas)
- [Respostas](#Respostas)
  - [Enviar](#Enviar-resposta)
  - [Editar](#Editar-resposta)
  - [Buscar](#Buscar-resposta)
- [Feedback](#Feedback)
  - [Enviar](#Enviar-feedback)
  - [Listar](#Listar-respostas-com-feedback)
  

## Usuários

### Cadastro de usuário

#### Dados:

| Campo      | Tipo de dado | Requisitos            | Obrigatório            |
| :--------- | :----------- | :-------------------- | :--------------------- |
| id         | String       | Apenas números        | sim                    |
| name       | String       | -                     | sim                    |
| email      | String       | blablabla@blablabla   | sim                    |
| password   | String       | Ao menos 6 caracteres | sim                    |
| is_teacher | boolean      | -                     | não (false por padrão) |

#### Corpo da requisição:

Método: `POST` <br>
Rota: `/users`

```json
{
  "id": "20184906",
  "name": "Lucas Sônego",
  "email": "lucassonego@ufpr.br",
  "password": "123456",
  "is_teacher": false
}
```

> Para o cadastro de um professor basta enviar o campo `is_teacher: true` no corpo da requisição.

#### Corpo da resposta:

```json
{
  "id": "20184906",
  "name": "Lucas Sônego",
  "email": "lucassonego@ufpr.br",
  "is_teacher": false
}
```



### Login

#### Dados

| Campo    | Tipo de dado | Requisitos            | Obrigatório |
| :------- | :----------- | :-------------------- | :---------- |
| email    | String       | blablabla@blablabla   | sim         |
| password | String       | Ao menos 6 caracteres | sim         |

#### Corpo da requisição:

Método: `POST` <br>
Rota: `/sessions`

```json
{
  "email": "lucassonego@ufpr.br",
  "password": "123456"
}
```

#### Corpo da resposta:

```json
{
  "user": {
    "id": "20184906",
    "name": "Lucas Sônego",
    "email": "lucassonego@ufpr.br",
    "is_teacher": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM..."
}
```



### Validação de autenticação

#### Corpo da requisição:

Método: `GET` <br>
Rota: `/sessions` <br>Query params (opcional): `newtoken: true`, retorna um novo token de autenticação
O cabeçalho da requisição deve conter o _token_ de autenticação.

#### Corpo da resposta:

##### Sem _query string_:

```json
{
  "user": {
    "id": "20184906",
    "name": "Lucas Sônego",
    "email": "lucassonego@ufpr.br",
    "is_teacher": false
  },
}
```

##### Com `newtoken=true`

```json
{
  "user": {
    "id": "20184906",
    "name": "Lucas Sônego",
    "email": "lucassonego@ufpr.br",
    "is_teacher": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1NiIsImlhdCI6MTU4Nzc1ODMwMywiZXhwIjoxNTg4MzYzMTAzfQ.UtWJ0_Xz2kKU9feCI9lf72U1sB9dfAv5M5ffUjOI5JI"
}
```



### Editar dados

> Para as requisições de edição de dados, podem ser enviados apenas os campos que serão alterados

#### Dados

| Campo       | Tipo de dado | Requisitos                                | Obrigatório                                |
| :---------- | :----------- | :---------------------------------------- | :----------------------------------------- |
| name        | String       | -                                         | não                                        |
| email       | String       | blablabla@blablabla                       | não                                        |
| oldPassword | String       | Corresponder a senha antiga deste usuário | Apenas quando o campo password for enviado |
| password    | String       | Ao menos 6 caracteres                     | não                                        |
| is_teacher  | boolean      | -                                         | não                                        |

#### Corpo da requisição:

Método: `PUT` <br>
Rota: `/users` <br>
O cabeçalho da requisição deve conter o token de autenticação.

```json
{
  "email": "lucassonegoo@gmail.com",
  "oldPassword": "123456",
  "password": "654321",
  "is_teacher": true
}
```

#### Corpo da resposta:

```json
{
  "id": "20184906",
  "name": "Lucas Sônego",
  "email": "lucassonegoo@gmail.com",
  "is_teacher": true
}
```



### Listar

#### Listar todos os usuários

Método: `GET` <br>
Rota: `/users` <br>
O cabeçalho da requisição deve conter o token de autenticação.

#### Listar apenas os professores ou estudantes

Método: `GET` <br>
Rota: `/users` <br>Query params: `type=teachers` ou `type=students` <br>O cabeçalho da requisição deve conter o token de autenticação.

#### Corpo da resposta:

##### Com `type=students` ou sem _query params_:

```json
[
  {
    "id": "1",
    "name": "Usuario 1",
    "email": "usuario1@ufpr.br",
    "is_teacher": false
  },
  {
    "id": "2",
    "name": "Usuario 2",
    "email": "usuario2@ufpr.br",
    "is_teacher": false
  },
  {
    "id": "3",
    "name": "Usuario 3",
    "email": "usuario3@ufpr.br",
    "is_teacher": true
  }
]
```

##### Com `type=teachers`

```json
[
  {
    "id": "1",
    "name": "Professor 1",
    "email": "professor1@ufpr.br",
    "is_teacher": true,
    "disciplines": [
      {
        "id": "2020D1",
        "name": "Disciplina 1"
      }
    ]
  },
  {
    "id": "2",
    "name": "Professor 2",
    "email": "professor2@ufpr.br",
    "is_teacher": true,
    "disciplines": [
      {
        "id": "2020D2",
        "name": "Disciplina 2"
      },
      {
        "id": "2020D3",
        "name": "Disciplina 3"
      }
    ]
  }
]
```



## Disciplinas

### Criar disciplina

| Campo | Tipo de Dado | Requisitos          | Obrigatório |
| ----- | ------------ | ------------------- | ----------- |
| id    | String       | identificação única | sim         |
| name  | String       | -                   | sim         |

#### Corpo da requisição

Método `POST` <br>Rota `/disciplines`

O cabeçalho deve conter o token de autenticação de um usuário que seja professor

```json
{
  "id": "2020D1",
  "name": "Disciplina 1"
}
```

#### Corpo da resposta

```json
{
  "id": "2020D1",
  "name": "Disciplina 1",
  "teacher": {
    "id": "1",
    "name": "Professor 1",
    "email": "professor1@ufpr.br"
  }
}
```



### Editar disciplina

| Campo      | Tipo de dado | Requisitos                                    | Obrigatório |
| ---------- | ------------ | --------------------------------------------- | ----------- |
| name       | String       | -                                             | não         |
| newTeacher | String       | id válido, e de um usuário que seja professor | não         |

#### Corpo da requisição

Método: `PUT` <br>Rota: `/disciplines/2020D1` \*_id da disciplina que deseja editar_<br>

O cabeçalho da requisição deve conter o token de autenticação do professor desta disciplina

```json
{
  "name": "Novo nome",
  "newTeacher": "2"
}
```

#### Corpo da resposta

```json
{
  "id": "2020D1",
  "name": "Novo nome",
  "teacher": {
    "id": "2",
    "name": "Professor 2",
    "email": "professor2@ufpr.br"
  }
}
```



### Listar disciplinas

#### Listar todas as disciplinas

Método: `GET` <br>Rota: `/disciplines` <br>O cabeçalho da requisição deve conter um token válido, que pode ser tanto de um professor quanto de um estudante.

#### Buscar disciplinas de um único professor

Método: `GET` <br>Rota: `/disciplines` <br>Query params (opcionais):<br>`teacher=231412` \*_id do professor_: Lista apenas as disciplinas do professor buscado.<br>`id=2020D1` \*_id da disciplina_: Retorna dados da disciplina buscada, e lista todos os estudantes matriculados nesta disciplina

O cabeçalho da requisição deve conter um token válido, que pode ser tanto de um professor quanto de um estudante.

#### Corpo da resposta

Sem _query string_:

```json
{
  "enrolled_disciplines": [
    {
      "id": "2020D1",
      "name": "Discipline 1",
      "teacher": {
        "id": "654321",
        "name": "Teacher 1",
        "email": "teacher1@ufpr.br"
      }
    }
  ],
  "disciplines": [
    {
      "id": "2020D2",
      "name": "Discipline 2",
      "teacher": {
        "id": "654321",
        "name": "Teacher 1",
        "email": "teacher1@ufpr.br"
      }
    },
    {
      "id": "2020D3",
      "name": "Discipline 3",
      "teacher": {
        "id": "234567",
        "name": "Teacher 2",
        "email": "teacher2@ufpr.br"
      }
    }
  ]
}
```

Com _query_ `teacher`:

```json
[
  {
    "id": "2020D1",
    "name": "Discipline 1",
    "teacher": {
      "id": "654321",
      "name": "Teacher 1",
      "email": "teacher1@ufpr.br"
    }
  },
  {
    "id": "2020D2",
    "name": "Discipline 2",
    "teacher": {
      "id": "654321",
      "name": "Teacher 1",
      "email": "teacher1@ufpr.br"
    }
  },
  {
    "id": "2020D3",
    "name": "Discipline 3",
    "teacher": {
      "id": "654321",
      "name": "Teacher 1",
      "email": "teacher1@ufpr.br"
    }
  }
]
```

Com _query_ `id` (para o professor vinculado a disciplina):

```json
{
  "id": "2020D1",
  "name": "Disciplina 1",
  "teacher": {
    "id": "654321",
    "name": "Teacher 1",
    "email": "teacher1@ufpr.br"
  },
  "enrollments": [
    {
      "created_at": "2020-04-20T15:31:33.477Z",
      "student": {
        "id": "1234",
        "name": "Estudante 1",
        "email": "estudante1@ufpr.br"
      }
    },
    {
      "created_at": "2020-04-20T15:32:21.477Z",
      "student": {
        "id": "4321",
        "name": "Estudante 2",
        "email": "estudante2@ufpr.br"
      }
    }
  ]
}
```

Com _query_ `id` (para um estudante):

```json
{
  "id": "2020D1",
  "name": "Disciplina 1",
  "teacher": {
    "id": "654321",
    "name": "Teacher 1",
    "email": "teacher1@ufpr.br"
  }
}
```



### Deletar disciplina

#### Requisição

Método: `DELETE` <br>Rota: `/disciplines/2020D1` \*_id da disciplina que deseja deletar_

O cabeçalho da requisição deve conter o token de autenticação do professor desta disciplina

#### Resposta

```json
{
  "message": "Disciplina removida com sucesso"
}
```

> OBS: Deletar uma disciplina não irá apaga-la do banco de dados (_soft delete_), a disciplina apenas não será mais listada.



## Matrículas

### Efetuar matrícula

#### Requisição

Método: `GET`<br>Rota: `/enrollments/2020D1` \*_id da disciplina_

O cabeçalho da requisição deve conter o token de autenticação do estudante

#### Corpo da resposta

```json
{
  "discipline_id": "2020D1",
  "student_id": "20184906",
  "createdAt": "2020-04-20T15:31:33.477Z"
}
```



### Remover matrícula

#### Requisição

Método: `DELETE`<br>Rota: `/enrollments/2020D1` \*_id da disciplina_

O cabeçalho da requisição deve conter o token de autenticação do estudante matriculado

#### Corpo da resposta

```json
{
  "message": "Matrícula removida"
}
```



## Tarefas

### Criar Tarefa

#### Corpo da requisição 

Método: `POST`<br>Rota: `/tasks/2020D1` _*id da disciplina_

O cabeçalho da requisição deve conter o token de autenticação do professor vinculado à disciplina em que a tarefa será criada

```json
{
    "title": "Task 1",
    "description": "Description for task 1",
    "code": "function example()",
    "language": "javascript"
}
```

| Campo       | Tipo de dado | Requisitos | Obrigatório |
| ----------- | ------------ | ---------- | ----------- |
| title       | String       | -          | sim         |
| description | String       | -          | sim         |
| code        | String       | -          | não         |
| language    | String       | -          | não         |



#### Corpo da resposta

```json
{
  "id": "2020D1wAFgrq",
  "discipline": {
    "id": "2020D1",
    "name": "Test discipline 1",
    "teacher": {
      "id": "654321",
      "name": "Test Teacher",
      "email": "testteacher@ufpr.br"
    }
  },
  "title": "Task 1",
  "description": "Description for task 1",
  "code": "function example()",
  "language": "javascript"
}
```



### Editar Tarefa

#### Corpo da requisição 

Método: `PUT`<br>Rota: `/tasks/2020D1` _*id da disciplina_

O cabeçalho da requisição deve conter o token de autenticação do professor vinculado à disciplina em que a tarefa foi criada

```json
{
  "title": "Task 1",
  "description": "Description for task 1",
  "code": "function example()",
  "language": "javascript"
}
```

| Campo       | Tipo de dado | Requisitos | Obrigatório |
| ----------- | ------------ | ---------- | ----------- |
| title       | String       | -          | não         |
| description | String       | -          | não         |
| code        | String       | -          | não         |
| language    | String       | -          | não         |



#### Corpo da resposta

```json
{
  "id": "2020D1wAFgrq",
  "discipline": {
    "id": "2020D1",
    "name": "Test discipline 1",
    "teacher": {
      "id": "654321",
      "name": "Test Teacher",
      "email": "testteacher@ufpr.br"
    }
  },
  "title": "Task 1",
  "description": "Description for task 1",
  "code": "function example()",
  "language": "javascript"
}
```



### Listar tarefas

#### Requisição

Método: `GET`<br>Rota: `/tasks`<br>Query params (opcionais): <br>`discipline=2020D1` _*id da disciplina_<br>`id=2020D1wAFgrq` _*id da tarefa_

#### Corpo da resposta (sem query, para um estudante)

```json
[
  {
    "id": "2020D1",
    "name": "Test discipline 1",
    "tasks": [
      {
        "id": "2020D1O0hsGW",
        "title": "Teste",
        "description": "Mussum Ipsum, cacilds vidis litro abertis.\r\n",
        "code": "function teste(){}",
        "language": "javascript",
        "closed_at": null,
        "answer": null
      }
    ]
  },
  {
    "id": "2020D2",
    "name": "Test discipline 2",
    "tasks": [
      {
        "id": "2020D2JwqUcr",
        "title": "Teste",
        "description": "Mussum Ipsum, cacilds vidis litro abertis.\r\n",
        "code": "function teste(){}",
        "language": "javascript",
        "closed_at": null,
        "answer": null
      },
      {
        "id": "2020D2di5mxL",
        "title": "Teste",
        "description": "Mussum Ipsum, cacilds vidis litro abertis.",
        "code": "function teste(){}",
        "language": "javascript",
        "closed_at": "2020-05-20T18:02:35.757Z",
        "answer": {
          "code": "function teste()",
          "language": "javascript",
          "feedback": null,
          "feedback_code": null,
          "feedback_at": null,
          "updated_at": "2020-05-18T00:10:48.309Z",
          "accepted_at": "2020-05-18T00:10:48.309Z",
        }
      }
    ]
  }
]
```

#### Corpo da resposta (sem query, para um professor)

```json
[
  {
    "id": "TD1",
    "name": "Test Discipline 1",
    "tasks": [
      {
        "id": "TD1di5mxL",
        "title": "Task 1",
        "description": "Task 1 desctiption",
        "code": "function teste(){}",
        "language": "javascript",
        "created_at": "2020-05-17T22:20:50.982Z",
        "answers": [
          {
            "id": "TD1di5mxL123456",
            "code": "function test()",
            "language": "javascript",
            "feedback": null,
            "feedback_code": null,
            "feedback_at": null,
            "created_at": "2020-05-17T22:22:18.801Z",
            "updated_at": "2020-05-18T00:10:48.310Z",
            "accepted_at": "2020-05-18T00:10:48.309Z",
            "student": {
              "id": "123456",
              "name": "Test User",
              "email": "testuser@ufpr.br"
            }
          },
          {
            "id": "TD1di5mxL112233",
            "code": "function test()",
            "language": "javascript",
            "feedback": null,
            "feedback_code": null,
            "feedback_at": null,
            "created_at": "2020-05-18T00:10:48.309Z",
            "updated_at": "2020-05-18T00:10:48.309Z",
            "accepted_at": null,
            "student": {
              "id": "112233",
              "name": "Test User 2",
              "email": "testuser2@ufpr.br"
            }
          }
        ]
      },
      {
        "id": "TD1JwqUcr",
        "title": "Task 2",
        "description": "Task 2 description",
        "code": "function test(){}",
        "language": "javascript",
        "created_at": "2020-05-19T01:44:06.797Z",
        "answers": []
      }
    ]
  },
  {
    "id": "TD2",
    "name": "Test Discipline 2",
    "tasks": [
      {
        "id": "TD2Mzc2NT",
        "title": "Tarefa respondida",
        "description": "tarefa respondida",
        "code": null,
        "language": null,
        "created_at": "2020-05-19T23:05:16.038Z",
        "answers": [
          {
            "id": "TD2Mzc2NT123456",
            "code": "function test()",
            "language": "javascript",
            "feedback": null,
            "feedback_code": null,
            "feedback_at": null,
            "created_at": "2020-06-18T17:02:17.238Z",
            "updated_at": "2020-06-19T20:56:18.500Z",
            "accepted_at": null,
            "student": {
              "id": "123456",
              "name": "Test User",
              "email": "testuser@ufpr.br"
            }
          }
        ]
      }
    ]
  }
]
```







#### Corpo da resposta (com query `discipline=2020D1`)

```json
{
  "open": [
    {
      "id": "2020D1JwqUcr",
      "title": "Teste",
      "description": "Mussum Ipsum, cacilds vidis litro abertis.",
      "code": "function teste(){}",
      "language": "javascript",
      "closed_at": null
    }
  ],
  "closed": [
    {
      "id": "2020D1di5mxL",
      "title": "Teste",
      "description": "Mussum Ipsum, cacilds vidis litro abertis.",
      "code": "function teste(){}",
      "language": "javascript",
      "closed_at": "2020-05-20T18:02:35.757Z"
    }
  ]
}
```



#### Corpo da resposta (com query `id=2020D1JwqUcr`)

```json
{
  "id": "2020D1JwqUcr",
  "title": "Teste",
  "description": "Mussum Ipsum, cacilds vidis litro abertis.\r\n",
  "code": "function teste(){}",
  "language": "javascript",
  "closed_at": null,
  "discipline": {
    "id": "2020D1",
    "name": "Test discipline 1",
    "teacher": {
      "id": "654321",
      "name": "Test Teacher",
      "email": "testteacher@ufpr.br"
    }
  },
  "answer": {
    "id": "2020D1JwqUcr123456",
    "code": "function teste()",
    "language": "javascript",
    "feedback": null,
    "feedback_code": null,
    "feedback_at": "2020-05-18T00:10:48.309Z",  
    "accepted_at": "2020-05-18T00:10:48.309Z"
  },
  "user_enrolled": true
}
```



### Fechar tarefa (não aceitar mais respostas)

#### Corpo da requisição

Método: `DELETE`<br>Rota: `/tasks/2020D1wAFgrq` _*id da tarefa_

O cabeçalho da requisição deve conter o token de autenticação do professor vinculado à disciplina em que a tarefa foi criada

#### Corpo da resposta 

```json
{
  "message": "Tarefa fechada com sucesso"
}
```



### Reabrir tarefa (voltar a aceitar respostas)

#### Corpo da requisição

Método: `PATCH`<br>Rota: `/tasks/2020D1wAFgrq` _*id da tarefa_

O cabeçalho da requisição deve conter o token de autenticação do professor vinculado à disciplina em que a tarefa foi criada

#### Corpo da resposta 

```json
{
  "message": "Tarefa reaberta com sucesso"
}
```



## Respostas

### Enviar resposta

#### Corpo da requisição

Método: `POST`<br>Rota: `/answers/2020D1JwqUcr` _*id da tarefa_

O cabeçalho da requisição deve conter o token de autenticação de um estudante matriculadona disciplina em que a tarefa foi criada

```json
{
    "code": "function example()"
}
```

| Campo | Tipo de dado | Requisitos | Obrigatório |
| ----- | ------------ | ---------- | ----------- |
| code  | String       | -          | sim         |



#### Corpo da resposta

```json
{
  "id": "2020D1JwqUcr20184906",
  "task": {
    "id": "2020D1JwqUcr",
    "title": "Title for the task",
    "description": "Description for the task",
    "code": "function exampleTask()",
    "closed_at": null
  },
  "code": "function example"
}
```



### Editar resposta

#### Corpo da requisição

Método: `PUT`<br>Rota: `/answers/2020D1JwqUcr` _*id da tarefa_

O cabeçalho da requisição deve conter o token de autenticação de um estudante matriculadona disciplina em que a tarefa foi criada

```json
{
    "code": "function example()"
}
```



#### Corpo da resposta

```json
{
  "id": "2020D1JwqUcr20184906",
  "task": {
    "id": "2020D1JwqUcr",
    "title": "Title for the task",
    "description": "Description for the task",
    "code": "function exampleTask()",
    "closed_at": null
  },
  "code": "function example"
}
```



### Buscar resposta

#### Corpo da requisição (busca por meio do _id_ da tarefa)

Método: `GET`<br>Rota: `/answers/2020D1JwqUcr` _*id da tarefa_

O cabeçalho da requisição deve conter o token de autenticação de um estudante matriculadona disciplina em que a tarefa foi criada

#### Corpo da resposta

```json
{
  "code": "function example()",
  "language": "javascript",
  "feedback": "Nice",
  "feedback_code": null,
  "feedback_at": "2020-05-18T00:10:48.309Z",
  "accepted_at": "2020-05-18T00:10:48.309Z",
  "updated_at": "2020-05-18T00:09:23.623Z",
  "student": {
    "id": "123456",
    "name": "Test User",
    "email": "testuser@ufpr.br"
  }
}
```



#### Corpo da requisição (busca por meio do _id_ da resposta)

Método: `GET`<br>Rota: `/answers`<br>Query params: `id: TD2-5123456 `  _*id da resposta_

O cabeçalho da requisição deve conter o token de autenticação de um estudante matriculadona disciplina em que a tarefa foi criada

#### Corpo da resposta

```json
{
  "id": "TD2-5123456",
  "code": "function teste(parametro) {\n  if (parametro === \"teste\") {\n    console.log(\"teste\");\n  }\n}\n\nteste(\"teste\");",
  "language": "javascript",
  "feedback": null,
  "feedback_code": null,
  "feedback_at": null,
  "created_at": "2020-06-18T17:02:17.238Z",
  "updated_at": "2020-06-19T20:56:18.500Z",
  "accepted_at": null,
  "task": {
    "id": "TD2-5",
    "title": "Tarefa teste 5",
    "description": "tarefa teste 5",
    "code": "function teste()",
    "language": null,
    "closed_at": "2020-06-29T19:09:52.880Z",
    "discipline": {
      "id": "TD2",
      "name": "Testes de Tarefas",
      "teacher": {
        "id": "654321",
        "name": "Test Teacher",
        "email": "testteacher@ufpr.br"
      }
    }
  },
  "student": {
    "id": "123456",
    "name": "Test User",
    "email": "testuser@ufpr.br"
  }
}
```





## Feedback

### Enviar feedback

#### Corpo da requisição

Método: `PUT`<br>Rota: `/feedback/2020D1JwqUcr20184906` _*id da resposta_

O cabeçalho da requisição deve conter o token de autenticação do professor vinculado à disciplina em que a tarefa foi criada

```json
{
  "feedback": "Some feedback",
  "code": "function someCode()",
  "accepted": true
}
```

| Campo    | Tipo de dado | Requisitos | Obrigatório |
| -------- | ------------ | ---------- | ----------- |
| feedback | String       | -          | não         |
| code     | String       | -          | não         |
| accepted | Boolean      | -          | não         |



#### Corpo da resposta

```json
{
  "id": "2020D1JwqUcr20184906",
  "code": "function example()",
  "feedback": "Some feedback",
  "feedback_code": "function someCode()",
  "accepted_at": "2020-05-18T00:10:48.309Z"
}
```



### Listar respostas com feedback

#### Requisição

Método: `GET`<br>Rota: `/feedback`

O cabeçalho da requisição deve conter um token de autenticação.

#### Corpo da resposta (para um estudante)

(Lista os feedbacks de todas as respostas enviadas pelo estudante)

```json
[
  {
    "id":"TD1di5mxL123456",
    "code": "function answer()",
    "language": "javascript",
    "feedback": "All ok",
    "feedback_code": null,
    "feedback_at": "2020-06-24T20:43:14.510Z",
    "accepted_at": "2020-06-24T20:43:14.510Z",
    "updated_at": "2020-05-11T00:06:07.775Z",
    "task": {
      "id": "TD1di5mxL",
      "title": "Test",
      "description": "test",
      "code": "function test(){}",
      "language": null,
      "closed_at": null,
      "discipline": {
        "id": "TD1",
        "name": "Test discipline 1"
      }
    }
  }
]
```

#### Corpo da resposta (para um professor)

(Lista todos os feedbacks enviados por esse professor)

```json
[
  {
    id: "TD1di5mxL123456",
    code: "function answer()",
    language: "javascript",
    feedback: "All ok",
    feedback_code: null,
    feedback_at: "2020-06-24T20:43:14.510Z",
    accepted_at: "2020-06-24T20:43:14.510Z",
    updated_at: "2020-05-11T00:06:07.775Z",
    student: {
      id: "123456",
      name: "Test User",
      email: "testuser@ufpr.br"
    },
    task: {
      id: "TD1di5mxL",
      title: "Test",
      description: "test",
      code: "function test(){}",
      language: null,
      closed_at: null,
      discipline: {
        id: "TD1",
        name: "Test Discipline 1"
      }
    }
  }
];
```

