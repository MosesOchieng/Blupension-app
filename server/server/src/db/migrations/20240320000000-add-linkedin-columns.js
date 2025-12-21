export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("Users", "linkedinId", {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  });

  await queryInterface.addColumn("Users", "isLinkedInUser", {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("Users", "linkedinId");
  await queryInterface.removeColumn("Users", "isLinkedInUser");
}
