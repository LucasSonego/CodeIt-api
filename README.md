# Documentação Solve It API
### Sumario:
 - [Usuários](#Usuários)
    - [Cadastro](#Cadastro-de-usuário)
    - [Login](#Login)
    - [Editar Dados](#Editar-dados)
    - [Listar](#Listar)
    
## Usuários

### Cadastro de usuário

#### Dados:
| Campo      | Tipo de dado  | Requisitos            | Obrigatório            |
| :--------- |:--------------| :-------------------- | :--------------------- |
| name       | String        | -                     | sim                    |
| email      | String        | blablabla@blablabla   | sim                    |
| password   | String        | Ao menos 6 caracteres | sim                    |
| is_teacher | boolean       | -                     | não (false por padrão) |

#### Corpo da requisição:

Metodo: `POST`. <br>
Rota: `/users`
```json
{
  "name": "Lucas Sônego",
  "email": "lucassonego@ufpr.br",
  "password": "123456",
}
```
> Para o cadastro de um professor basta adicionar o campo `is_teacher: true` no corpo da requisição.

#### Corpo da resposta:
```json
{
  "id": 1,
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
Método: `POST`. <br>
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
    "id": 1,
    "name": "Lucas Sônego",
    "email": "lucassonego@ufpr.br",
   },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM..."
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
> Método: `PUT`. <br>
Rota: `/sessions` <br>
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
  "id": 1,
  "name": "Lucas Sônego",
  "email": "lucassonegoo@gmail.com",
  "is_teacher": true
}
```


### Listar

#### Listar todos os usuários

> Metodo `GET` <br>
Rota `/users` <br>
O cabeçalho da requisição deve conter o token de autenticação.

#### Listar apenas os professores

> Metodo `GET` <br>
Rota `/teachers` <br>
O cabeçalho da requisição deve conter o token de autenticação.

#### Corpo da resposta:
```json
[
  {
    "id": 1,
    "name": "Usuario 1",
    "email": "usuario1@ufpr.br",
    "is_teacher": false
  },
    {
    "id": 2,
    "name": "Usuario 2",
    "email": "usuario2@ufpr.br",
    "is_teacher": false
  },
    {
    "id": 3,
    "name": "Usuario 3",
    "email": "usuario3@ufpr.br",
    "is_teacher": true
  }
]
```
