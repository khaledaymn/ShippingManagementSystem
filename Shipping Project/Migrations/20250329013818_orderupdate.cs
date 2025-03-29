using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shipping_Project.Migrations
{
    /// <inheritdoc />
    public partial class orderupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ShippigRepresentatives_ShippigRepresentativeId",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "ShippigRepresentativeId",
                table: "Orders",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "orderDate",
                table: "Orders",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ShippigRepresentatives_ShippigRepresentativeId",
                table: "Orders",
                column: "ShippigRepresentativeId",
                principalTable: "ShippigRepresentatives",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ShippigRepresentatives_ShippigRepresentativeId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "orderDate",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "ShippigRepresentativeId",
                table: "Orders",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ShippigRepresentatives_ShippigRepresentativeId",
                table: "Orders",
                column: "ShippigRepresentativeId",
                principalTable: "ShippigRepresentatives",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
