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
## Usuários

### Cadastro de usuário

#### Dados:
| Campo      | Tipo de dado  | Requisitos            | Obrigatório            |
| :--------- |:--------------| :-------------------- | :--------------------- |
| id         | String        | Apenas números        | sim                    |
| name       | String        | -                     | sim                    |
| email      | String        | blablabla@blablabla   | sim                    |
| password   | String        | Ao menos 6 caracteres | sim                    |
| is_teacher | boolean       | -                     | não (false por padrão) |

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
| Campo      | Tipo de dado  | Requisitos            | Obrigatório            |
| :--------- |:--------------| :-------------------- | :--------------------- |
| email      | String        | blablabla@blablabla   | sim                    |
| password   | String        | Ao menos 6 caracteres | sim                    |

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
Rota: `/sessions` <br>
O cabeçalho da requisição deve conter o *token* de autenticação.


#### Corpo da resposta:
```json
{
   "id": "20184906",
   "name": "Lucas Sônego",
   "email": "lucassonego@ufpr.br",
   "is_teacher": false
}
```



### Editar dados

> Para as requisições de edição de dados, podem ser enviados apenas os campos que serão alterados

#### Dados
| Campo       | Tipo de dado  | Requisitos                         | Obrigatório                                |
| :---------- |:--------------| :--------------------------------- | :----------------------------------------- |
| name        | String        | -                                  | não                                        |
| email       | String        | blablabla@blablabla                | não                                        |
| oldPassword | String        | Corresponder a senha antiga deste usuário   | Apenas quando o campo password for enviado |
| password    | String        | Ao menos 6 caracteres              | não                                        |
| is_teacher  | boolean       | -                                  | não                                        |

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

Método `GET` <br>
Rota `/users` <br>
O cabeçalho da requisição deve conter o token de autenticação.

#### Listar apenas os professores ou estudantes

Método `GET` <br>
Rota `/users` <br>Query params `type=teachers` ou `type=students` <br>O cabeçalho da requisição deve conter o token de autenticação.

#### Corpo da resposta:

#####  Com `type=students` ou sem *query params*:

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

Método `PUT` <br>Rota `/disciplines/2020D1` **id da disciplina que deseja editar*<br>

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

Método `GET` <br>Rota `/disciplines` <br>O cabeçalho da requisição deve conter um token válido, que pode ser tanto de um professor quanto de um estudante.

#### Buscar disciplinas de um único professor

Método `GET` <br>Rota `/disciplines` <br>Query params `teacher=231412` **id do professor*

O cabeçalho da requisição deve conter um token válido, que pode ser tanto de um professor quanto de um estudante.

#### Corpo da resposta

```json
[
  {
    "id": "2020D1",
    "name": "Disciplina 1",
    "teacher": {
      "id": "1",
      "name": "Professor 1",
      "email": "professor1@ufpr.br"
    }
  },
  {
    "id": "2020D2",
    "name": "Disciplina 2",
    "teacher": {
      "id": "2",
      "name": "Professor 2",
      "email": "professor2@ufpr.br"
    }
  }
]
```



### Deletar disciplina

#### Requisição

Método `DELETE` <br>Rota `/disciplines/2020D1` **id da disciplina que deseja deletar*

O cabeçalho da requisição deve conter o token de autenticação do professor desta disciplina

#### Resposta

```json
{
  "message": "Disciplina removida com sucesso"
}
```

> OBS: Deletar uma disciplina não irá apaga-la do banco de dados (*soft delete*), a disciplina apenas não será mais listada