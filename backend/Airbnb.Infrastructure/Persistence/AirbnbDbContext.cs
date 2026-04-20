using Airbnb.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Airbnb.Infrastructure.Persistence;

public class AirbnbDbContext : DbContext
{
    public AirbnbDbContext(DbContextOptions<AirbnbDbContext> options) : base(options) {}

    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<PropertyBlock> PropertyBlocks => Set<PropertyBlock>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de los usuarios
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.FullName).HasMaxLength(150);
        });

        // Configuración de propiedades
        modelBuilder.Entity<Property>(entity =>
        {
            entity.Property(p => p.PricePerNight).HasPrecision(18, 2);

            // Un host tiene muchas propiedades
            entity.HasOne(p => p.Host)
                .WithMany()
                .HasForeignKey(p => p.HostId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuración de reservas
        modelBuilder.Entity<Reservation>(entity =>
        {
            // Un usuario puede realizar muchas reservas
            entity.HasOne(r => r.Guest)
                .WithMany()
                .HasForeignKey(r => r.GuestId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Una propiedad tiene muchas reservas
            entity.HasOne(r => r.Property)
                .WithMany(p => p.Reservations)
                .HasForeignKey(r => r.PropertyId);
        });

        // Configuración de reseñas
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(r => r.ReservationId).IsUnique();
            entity.Property(r => r.Comment).HasMaxLength(1000);

            entity.HasOne(r => r.Property)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra la propiedad, se borran sus reseñas
                
            entity.HasOne(r => r.Guest)
                .WithMany()
                .HasForeignKey(r => r.GuestId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuración de notificaciones
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId);
        });

        // Configuración de las imagenes de las propiedades
        modelBuilder.Entity<PropertyImage>(entity =>
        {
            entity.HasOne(i => i.Property)
                .WithMany(p => p.Images)
                .HasForeignKey(i => i.PropertyId)
                .OnDelete(DeleteBehavior.Cascade); // Si se borra la propiedad, se borran los registros de sus imágenes
        });
    }
}