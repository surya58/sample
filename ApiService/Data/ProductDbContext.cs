namespace ApiService.Data;

using Microsoft.EntityFrameworkCore;
using ApiService.Product.Models;

public class ProductDbContext(DbContextOptions<ProductDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<ProductCategory> ProductCategories { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure Product-ProductCategory relationship
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
            
        // Configure Product entity
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);
            
        // Configure ProductCategory entity
        modelBuilder.Entity<ProductCategory>()
            .HasIndex(pc => pc.Name)
            .IsUnique();
    }
}
