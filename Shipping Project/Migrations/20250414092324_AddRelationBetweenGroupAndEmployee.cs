using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shipping_Project.Migrations
{
    /// <inheritdoc />
    public partial class AddRelationBetweenGroupAndEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GroupId",
                table: "Employees",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PermassionId",
                table: "Employees",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_GroupId",
                table: "Employees",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Groups_GroupId",
                table: "Employees",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Groups_GroupId",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_GroupId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "PermassionId",
                table: "Employees");
        }
    }
}
