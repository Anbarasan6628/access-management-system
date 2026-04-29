using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccessManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRiskScoreCache : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RiskLevel",
                table: "ChangeRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RiskReason",
                table: "ChangeRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RiskScore",
                table: "ChangeRequests",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RiskLevel",
                table: "ChangeRequests");

            migrationBuilder.DropColumn(
                name: "RiskReason",
                table: "ChangeRequests");

            migrationBuilder.DropColumn(
                name: "RiskScore",
                table: "ChangeRequests");
        }
    }
}
