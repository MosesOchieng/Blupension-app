export async function up(queryInterface, Sequelize) {
  // Add verification_code column
  await queryInterface.addColumn("users", "verification_code", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  // Add verification_code_expiry column
  await queryInterface.addColumn("users", "verification_code_expiry", {
    type: Sequelize.DATE,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  // Remove verification_code_expiry column
  await queryInterface.removeColumn("users", "verification_code_expiry");
  
  // Remove verification_code column
  await queryInterface.removeColumn("users", "verification_code");
}

