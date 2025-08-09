import { DataTypes, Model, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";

class Warns extends Model<InferAttributes<Warns>, InferCreationAttributes<Warns, { omit: 'id' }>> {
  declare id: number;
  declare reasons: string;
  declare createdAt: number;

  static initModel(sequelize: Sequelize) {
    Warns.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        reasons: {
          type: DataTypes.TEXT,
          validate: {
            max: 100,
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
      { sequelize, tableName: "warnings", timestamps: false }
    );
  }
}

export default Warns;