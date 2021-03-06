import Sequelize, { Model } from "sequelize";

class Answer extends Model {
  static init(sequelize) {
    super.init(
      {
        code: Sequelize.TEXT,
        language: Sequelize.STRING,
        feedback: Sequelize.TEXT,
        feedback_code: Sequelize.TEXT,
        feedback_at: Sequelize.DATE,
        accepted_at: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "student",
    });

    this.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
    });
  }
}

export default Answer;
