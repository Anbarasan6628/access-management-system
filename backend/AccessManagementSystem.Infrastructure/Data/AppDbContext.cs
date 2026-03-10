using AccessManagementSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AccessManagementSystem.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ChangeRequest> ChangeRequests { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Added)
                    entry.Entity.CreatedDate = DateTime.UtcNow;

                if (entry.State == EntityState.Modified)
                    entry.Entity.UpdatedDate = DateTime.UtcNow;
            }
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Soft delete global filters
            modelBuilder.Entity<User>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<ChangeRequest>().HasQueryFilter(x => !x.IsDeleted);
            modelBuilder.Entity<AuditLog>().HasQueryFilter(x => !x.IsDeleted);

            // ChangeRequest relationships
            modelBuilder.Entity<ChangeRequest>()
                .HasOne(x => x.CreatedBy)
                .WithMany()
                .HasForeignKey(x => x.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChangeRequest>()
                .HasOne(x => x.AssignedReviewer)
                .WithMany()
                .HasForeignKey(x => x.AssignedReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            // AuditLog relationships
            modelBuilder.Entity<AuditLog>()
                .HasOne(x => x.Request)
                .WithMany()
                .HasForeignKey(x => x.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AuditLog>()
                .HasOne(x => x.ChangedBy)
                .WithMany()
                .HasForeignKey(x => x.ChangedById)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}