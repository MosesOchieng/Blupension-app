export async function up(queryInterface, Sequelize) {
  const isSQLite = queryInterface.sequelize.getDialect() === "sqlite";
  // Create sequence first
  if (!isSQLite) {
    await queryInterface.sequelize.query(
      'CREATE SEQUENCE IF NOT EXISTS "achievements_id_seq_custom_20240319";',
    );
  }

  // Create enum types (PostgreSQL only)
  if (!isSQLite) {
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_achievements_category\" AS ENUM ('investment', 'trading', 'community', 'security', 'engagement');",
  );
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_achievements_reward_currency\" AS ENUM ('USD', 'BPT');",
  );
  await queryInterface.sequelize.query(
    "CREATE TYPE \"enum_achievements_status\" AS ENUM ('in_progress', 'completed', 'claimed');",
  );
  }

  // Create table with sequence
  await queryInterface.createTable("achievements", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: isSQLite,
      defaultValue: isSQLite 
        ? undefined 
        : Sequelize.literal("nextval('\"achievements_id_seq_custom_20240319\"')"),
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
    category: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "investment",
      validate: {
        isIn: [["investment", "social", "activity", "referral", "special"]],
      },
    },
    level: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    progress: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    target: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    reward: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    rewardCurrency: {
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
      defaultValue: "in_progress",
      validate: {
        isIn: [["in_progress", "completed", "claimed"]],
      },
    },
    completedAt: {
      type: Sequelize.DATE,
    },
    claimedAt: {
      type: Sequelize.DATE,
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
  await queryInterface.dropTable("achievements");
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_achievements_category";',
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_achievements_reward_currency";',
  );
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_achievements_status";',
  );
  await queryInterface.sequelize.query(
    'DROP SEQUENCE IF EXISTS "achievements_id_seq_custom_20240319";',
  );
}
