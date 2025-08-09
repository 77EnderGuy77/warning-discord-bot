import { DataTypes, Model, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";

class Mutes extends Model<InferAttributes<Mutes>, InferCreationAttributes<Mutes, { omit: 'id' }>> {
  declare id: number;
  declare reasons: string;
  declare createdAt: number;

  static initModel(sequelize: Sequelize) {
    Mutes.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        reasons: {
          type: DataTypes.TEXT,
          validate: {
            max: 500,
          },
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            is: /^[0-9]{10}$/
          }
        },
      },
      { sequelize, tableName: "mutes", timestamps: false }
    );
  }
}

export default Mutes;