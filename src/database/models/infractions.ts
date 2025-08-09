import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

class Infractions extends Model<
  InferAttributes<Infractions>,
  InferCreationAttributes<Infractions, { omit: "id" }>
> {
  declare id: number;
  declare infractionID: number;
  declare userID: string;
  declare modID: string;
  declare type: "warn" | "mute";

  static initModel(sequelize: Sequelize) {
    Infractions.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        infractionID: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userID: {
          type: DataTypes.STRING(19),
          allowNull: false,
          validate: {
            is: /^[0-9]{18,19}$/,
          },
        },
        modID: {
          type: DataTypes.STRING(19),
          allowNull: false,
          validate: {
            is: /^[0-9]{18,19}$/,
          },
        },
        type: {
          type: DataTypes.STRING(4),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "infractions",
        timestamps: false,
      }
    );
  }
}

export default Infractions;