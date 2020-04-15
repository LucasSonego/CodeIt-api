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
  }
}

export default Discipline;
