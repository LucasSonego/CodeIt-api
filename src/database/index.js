import Sequelize from "sequelize";

import databaseConfig from "../config/database";

import User from "../app/models/User";
import Discipline from "../app/models/Discipline";
import Enrollment from "../app/models/Enrollment";
import Task from "../app/models/Task";
import Answer from "../app/models/Answer";

const models = [User, Discipline, Enrollment, Task, Answer];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
