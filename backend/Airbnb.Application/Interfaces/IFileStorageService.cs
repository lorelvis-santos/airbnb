namespace Airbnb.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream content, string extension);
    Task DeleteFileAsync(string fileUrl);
}