export async function up(queryInterface, Sequelize) {
  const isSQLite = queryInterface.sequelize.getDialect() === "sqlite";
  
  // Create sequence first (PostgreSQL only)
  if (!isSQLite) {
  await queryInterface.sequelize.query(
      'CREATE SEQUENCE IF NOT EXISTS "portfolios_id_seq_custom_20240319";',
  );
  }

  // Create table with sequence
  await queryInterface.createTable("portfolios", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: isSQLite,
      defaultValue: isSQLite 
        ? undefined 
        : Sequelize.literal("nextval('\"portfolios_id_seq_custom_20240319\"')"),
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
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
    strategy: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "moderate",
      validate: {
        isIn: [["conservative", "moderate", "aggressive"]],
      },
    },
    totalValue: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    allocation: {
      type: Sequelize.JSON,
      defaultValue: {},
    },
    performance: {
      type: Sequelize.JSON,
      defaultValue: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
      },
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "closed"]],
      },
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
  await queryInterface.dropTable("portfolios");
  await queryInterface.sequelize.query(
    'DROP SEQUENCE IF EXISTS "portfolios_id_seq_custom_20240319";',
  );
}
