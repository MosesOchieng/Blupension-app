export async function up(queryInterface, Sequelize) {
  const isSQLite = queryInterface.sequelize.getDialect() === "sqlite";
  // Create sequence first
  if (!isSQLite) {
    await queryInterface.sequelize.query(
      'CREATE SEQUENCE IF NOT EXISTS "rewards_id_seq_custom_20240319";',
    );
  }

  // Create table with sequence
  await queryInterface.createTable("rewards", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: isSQLite,
      defaultValue: isSQLite 
        ? undefined 
        : Sequelize.literal("nextval('\"rewards_id_seq_custom_20240319\"')"),
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "NO ACTION",
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "achievement",
      validate: {
        isIn: [["staking", "referral", "achievement", "bonus"]],
      },
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "BPT",
      validate: {
        isIn: [["USD", "BPT"]],
      },
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "claimed", "expired"]],
      },
    },
    claimedAt: {
      type: Sequelize.DATE,
    },
    expiresAt: {
      type: Sequelize.DATE,
    },
    description: {
      type: Sequelize.STRING,
    },
    metadata: {
      type: Sequelize.JSON,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("rewards");
  await queryInterface.sequelize.query(
    'DROP SEQUENCE IF EXISTS "rewards_id_seq_custom_20240319";',
  );
}
