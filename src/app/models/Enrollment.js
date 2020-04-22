import Sequelize, { Model } from "sequelize";

class Enrollment extends Model {
  static init(sequelize) {
    super.init(
      {},
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Discipline, {
      foreignKey: "discipline_id",
      as: "discipline",
    });

    this.belongsTo(models.User, {
      foreignKey: "student_id",
      as: "student",
    });
  }
}

export default Enrollment;
