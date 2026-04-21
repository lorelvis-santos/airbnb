namespace Airbnb.Application.Interfaces;

public interface IEmailService
{
    void SendEmailInBackground(string to, string subject, string body);
}