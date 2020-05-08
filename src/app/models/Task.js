import Sequelize, { Model } from "sequelize";

class Task extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.TEXT,
        description: Sequelize.TEXT,
        code: Sequelize.TEXT,
      },
      {
        sequelize,
        paranoid: true,
        deletedAt: "closed_at",
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Discipline, {
      foreignKey: "discipline_id",
      as: "discipline",
    });
  }
}

export default Task;
