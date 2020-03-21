import faker from "faker";
import { factory } from "factory-girl";
import User from "../src/app/models/User";

factory.define("User", User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  is_teacher: faker.random.boolean(),
});

export default factory;
