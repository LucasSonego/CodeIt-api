import Sequelize, { Model } from "sequelize";

class Discipline extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        paranoid: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "teacher_id",
      as: "teacher",
    });

    this.hasMany(models.Enrollment, {
      foreignKey: "discipline_id",
      as: "enrollments",
    });

    this.hasMany(models.Task, {
      foreignKey: "discipline_id",
      as: "tasks",
    });
  }
}

export default Discipline;
