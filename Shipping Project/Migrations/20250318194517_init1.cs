using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shipping_Project.Migrations
{
    /// <inheritdoc />
    public partial class init1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Branches_City_CiryId",
                table: "Branches");

            migrationBuilder.DropForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City");

            migrationBuilder.DropForeignKey(
                name: "FK_Employee_AspNetUsers_UserID",
                table: "Employee");

            migrationBuilder.DropForeignKey(
                name: "FK_Merchent_AspNetUsers_UserID",
                table: "Merchent");

            migrationBuilder.DropForeignKey(
                name: "FK_MerchentCity_City_CityId",
                table: "MerchentCity");

            migrationBuilder.DropForeignKey(
                name: "FK_MerchentCity_Merchent_MerchentId",
                table: "MerchentCity");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Branches_BranchId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_ChargeType_ChargeTypeId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_Merchent_MerchentId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_RejectedReason_RrjectedResonId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Order_ShippigRepresentive_ShippigRepresentiveId",
                table: "Order");

            migrationBuilder.DropForeignKey(
                name: "FK_Product_Order_OrderId",
                table: "Product");

            migrationBuilder.DropForeignKey(
                name: "FK_ShippigRepresentive_AspNetUsers_UserID",
                table: "ShippigRepresentive");

            migrationBuilder.DropForeignKey(
                name: "FK_ShippingRepGovernorate_Governorate_GovernorateId",
                table: "ShippingRepGovernorate");

            migrationBuilder.DropForeignKey(
                name: "FK_ShippingRepGovernorate_ShippigRepresentive_ShippingRepId",
                table: "ShippingRepGovernorate");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ShippigRepresentive",
                table: "ShippigRepresentive");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RejectedReason",
                table: "RejectedReason");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Product",
                table: "Product");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Order",
                table: "Order");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MerchentCity",
                table: "MerchentCity");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Merchent",
                table: "Merchent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Governorate",
                table: "Governorate");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Employee",
                table: "Employee");

            migrationBuilder.DropPrimaryKey(
                name: "PK_City",
                table: "City");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChargeType",
                table: "ChargeType");

            migrationBuilder.RenameTable(
                name: "ShippigRepresentive",
                newName: "ShippigRepresentives");

            migrationBuilder.RenameTable(
                name: "RejectedReason",
                newName: "RejectedReasons");

            migrationBuilder.RenameTable(
                name: "Product",
                newName: "Products");

            migrationBuilder.RenameTable(
                name: "Order",
                newName: "Orders");

            migrationBuilder.RenameTable(
                name: "MerchentCity",
                newName: "MerchentCities");

            migrationBuilder.RenameTable(
                name: "Merchent",
                newName: "Merchants");

            migrationBuilder.RenameTable(
                name: "Governorate",
                newName: "governorates");

            migrationBuilder.RenameTable(
                name: "Employee",
                newName: "Employees");

            migrationBuilder.RenameTable(
                name: "City",
                newName: "Citys");

            migrationBuilder.RenameTable(
                name: "ChargeType",
                newName: "ChargeTypes");

            migrationBuilder.RenameIndex(
                name: "IX_ShippigRepresentive_UserID",
                table: "ShippigRepresentives",
                newName: "IX_ShippigRepresentives_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Product_OrderId",
                table: "Products",
                newName: "IX_Products_OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Order_ShippigRepresentiveId",
                table: "Orders",
                newName: "IX_Orders_ShippigRepresentiveId");

            migrationBuilder.RenameIndex(
                name: "IX_Order_RrjectedResonId",
                table: "Orders",
                newName: "IX_Orders_RrjectedResonId");

            migrationBuilder.RenameIndex(
                name: "IX_Order_MerchentId",
                table: "Orders",
                newName: "IX_Orders_MerchentId");

            migrationBuilder.RenameIndex(
                name: "IX_Order_ChargeTypeId",
                table: "Orders",
                newName: "IX_Orders_ChargeTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Order_BranchId",
                table: "Orders",
                newName: "IX_Orders_BranchId");

            migrationBuilder.RenameIndex(
                name: "IX_MerchentCity_CityId",
                table: "MerchentCities",
                newName: "IX_MerchentCities_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_Merchent_UserID",
                table: "Merchants",
                newName: "IX_Merchants_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Employee_UserID",
                table: "Employees",
                newName: "IX_Employees_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_City_GovernorateId",
                table: "Citys",
                newName: "IX_Citys_GovernorateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShippigRepresentives",
                table: "ShippigRepresentives",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RejectedReasons",
                table: "RejectedReasons",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Orders",
                table: "Orders",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MerchentCities",
                table: "MerchentCities",
                columns: new[] { "MerchentId", "CityId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Merchants",
                table: "Merchants",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_governorates",
                table: "governorates",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Employees",
                table: "Employees",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Citys",
                table: "Citys",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChargeTypes",
                table: "ChargeTypes",
                column: "ID");

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreationDAte = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Standards",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StandardWeight = table.Column<int>(type: "int", nullable: false),
                    VillagePrice = table.Column<int>(type: "int", nullable: false),
                    KGprice = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Standards", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "PermissionGroups",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    Operation = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionGroups", x => new { x.PermissionId, x.GroupId });
                    table.ForeignKey(
                        name: "FK_PermissionGroups_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_PermissionGroups_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroups_GroupId",
                table: "PermissionGroups",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Citys_CiryId",
                table: "Branches",
                column: "CiryId",
                principalTable: "Citys",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Citys_governorates_GovernorateId",
                table: "Citys",
                column: "GovernorateId",
                principalTable: "governorates",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_AspNetUsers_UserID",
                table: "Employees",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Merchants_AspNetUsers_UserID",
                table: "Merchants",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_MerchentCities_Citys_CityId",
                table: "MerchentCities",
                column: "CityId",
                principalTable: "Citys",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_MerchentCities_Merchants_MerchentId",
                table: "MerchentCities",
                column: "MerchentId",
                principalTable: "Merchants",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Branches_BranchId",
                table: "Orders",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ChargeTypes_ChargeTypeId",
                table: "Orders",
                column: "ChargeTypeId",
                principalTable: "ChargeTypes",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Merchants_MerchentId",
                table: "Orders",
                column: "MerchentId",
                principalTable: "Merchants",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_RejectedReasons_RrjectedResonId",
                table: "Orders",
                column: "RrjectedResonId",
                principalTable: "RejectedReasons",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ShippigRepresentives_ShippigRepresentiveId",
                table: "Orders",
                column: "ShippigRepresentiveId",
                principalTable: "ShippigRepresentives",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Orders_OrderId",
                table: "Products",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_ShippigRepresentives_AspNetUsers_UserID",
                table: "ShippigRepresentives",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_ShippingRepGovernorate_ShippigRepresentives_ShippingRepId",
                table: "ShippingRepGovernorate",
                column: "ShippingRepId",
                principalTable: "ShippigRepresentives",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_ShippingRepGovernorate_governorates_GovernorateId",
                table: "ShippingRepGovernorate",
                column: "GovernorateId",
                principalTable: "governorates",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Citys_CiryId",
                table: "Branches");

            migrationBuilder.DropForeignKey(
                name: "FK_Citys_governorates_GovernorateId",
                table: "Citys");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_AspNetUsers_UserID",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Merchants_AspNetUsers_UserID",
                table: "Merchants");

            migrationBuilder.DropForeignKey(
                name: "FK_MerchentCities_Citys_CityId",
                table: "MerchentCities");

            migrationBuilder.DropForeignKey(
                name: "FK_MerchentCities_Merchants_MerchentId",
                table: "MerchentCities");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Branches_BranchId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ChargeTypes_ChargeTypeId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Merchants_MerchentId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_RejectedReasons_RrjectedResonId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ShippigRepresentives_ShippigRepresentiveId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Orders_OrderId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_ShippigRepresentives_AspNetUsers_UserID",
                table: "ShippigRepresentives");

            migrationBuilder.DropForeignKey(
                name: "FK_ShippingRepGovernorate_ShippigRepresentives_ShippingRepId",
                table: "ShippingRepGovernorate");

            migrationBuilder.DropForeignKey(
                name: "FK_ShippingRepGovernorate_governorates_GovernorateId",
                table: "ShippingRepGovernorate");

            migrationBuilder.DropTable(
                name: "PermissionGroups");

            migrationBuilder.DropTable(
                name: "Standards");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ShippigRepresentives",
                table: "ShippigRepresentives");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RejectedReasons",
                table: "RejectedReasons");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Orders",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MerchentCities",
                table: "MerchentCities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Merchants",
                table: "Merchants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_governorates",
                table: "governorates");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Employees",
                table: "Employees");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Citys",
                table: "Citys");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChargeTypes",
                table: "ChargeTypes");

            migrationBuilder.RenameTable(
                name: "ShippigRepresentives",
                newName: "ShippigRepresentive");

            migrationBuilder.RenameTable(
                name: "RejectedReasons",
                newName: "RejectedReason");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "Product");

            migrationBuilder.RenameTable(
                name: "Orders",
                newName: "Order");

            migrationBuilder.RenameTable(
                name: "MerchentCities",
                newName: "MerchentCity");

            migrationBuilder.RenameTable(
                name: "Merchants",
                newName: "Merchent");

            migrationBuilder.RenameTable(
                name: "governorates",
                newName: "Governorate");

            migrationBuilder.RenameTable(
                name: "Employees",
                newName: "Employee");

            migrationBuilder.RenameTable(
                name: "Citys",
                newName: "City");

            migrationBuilder.RenameTable(
                name: "ChargeTypes",
                newName: "ChargeType");

            migrationBuilder.RenameIndex(
                name: "IX_ShippigRepresentives_UserID",
                table: "ShippigRepresentive",
                newName: "IX_ShippigRepresentive_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Products_OrderId",
                table: "Product",
                newName: "IX_Product_OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_ShippigRepresentiveId",
                table: "Order",
                newName: "IX_Order_ShippigRepresentiveId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_RrjectedResonId",
                table: "Order",
                newName: "IX_Order_RrjectedResonId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_MerchentId",
                table: "Order",
                newName: "IX_Order_MerchentId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_ChargeTypeId",
                table: "Order",
                newName: "IX_Order_ChargeTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_BranchId",
                table: "Order",
                newName: "IX_Order_BranchId");

            migrationBuilder.RenameIndex(
                name: "IX_MerchentCities_CityId",
                table: "MerchentCity",
                newName: "IX_MerchentCity_CityId");

            migrationBuilder.RenameIndex(
                name: "IX_Merchants_UserID",
                table: "Merchent",
                newName: "IX_Merchent_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Employees_UserID",
                table: "Employee",
                newName: "IX_Employee_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Citys_GovernorateId",
                table: "City",
                newName: "IX_City_GovernorateId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShippigRepresentive",
                table: "ShippigRepresentive",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RejectedReason",
                table: "RejectedReason",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Product",
                table: "Product",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Order",
                table: "Order",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MerchentCity",
                table: "MerchentCity",
                columns: new[] { "MerchentId", "CityId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Merchent",
                table: "Merchent",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Governorate",
                table: "Governorate",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Employee",
                table: "Employee",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_City",
                table: "City",
                column: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChargeType",
                table: "ChargeType",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_City_CiryId",
                table: "Branches",
                column: "CiryId",
                principalTable: "City",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Employee_AspNetUsers_UserID",
                table: "Employee",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Merchent_AspNetUsers_UserID",
                table: "Merchent",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_MerchentCity_City_CityId",
                table: "MerchentCity",
                column: "CityId",
                principalTable: "City",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_MerchentCity_Merchent_MerchentId",
                table: "MerchentCity",
                column: "MerchentId",
                principalTable: "Merchent",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Branches_BranchId",
                table: "Order",
                column: "BranchId",
                principalTable: "Branches",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_ChargeType_ChargeTypeId",
                table: "Order",
                column: "ChargeTypeId",
                principalTable: "ChargeType",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_Merchent_MerchentId",
                table: "Order",
                column: "MerchentId",
                principalTable: "Merchent",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Order_RejectedReason_RrjectedResonId",
                table: "Order",
                column: "RrjectedResonId",
                principalTable: "RejectedReason",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Order_ShippigRepresentive_ShippigRepresentiveId",
                table: "Order",
                column: "ShippigRepresentiveId",
                principalTable: "ShippigRepresentive",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Product_Order_OrderId",
                table: "Product",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_ShippigRepresentive_AspNetUsers_UserID",
                table: "ShippigRepresentive",
                column: "UserID",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_ShippingRepGovernorate_Governorate_GovernorateId",
                table: "ShippingRepGovernorate",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_ShippingRepGovernorate_ShippigRepresentive_ShippingRepId",
                table: "ShippingRepGovernorate",
                column: "ShippingRepId",
                principalTable: "ShippigRepresentive",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);
        }
    }
}
