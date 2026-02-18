using Microsoft.EntityFrameworkCore;
using PasswordManagerAPI.Models;

namespace PasswordManagerAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<VaultItem> VaultItems { get; set; }
}