using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shipping_Project.Migrations
{
    /// <inheritdoc />
    public partial class v3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CityId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CityId",
                table: "Orders",
                column: "CityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Citys_CityId",
                table: "Orders",
                column: "CityId",
                principalTable: "Citys",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Citys_CityId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CityId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CityId",
                table: "Orders");
        }
    }
}
