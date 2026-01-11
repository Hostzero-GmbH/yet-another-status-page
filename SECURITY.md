# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Hostzero Status seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@hostzero.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass, etc.)
- **Full path(s) of source file(s)** related to the vulnerability
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact assessment** of the vulnerability
- **Any potential mitigations** you've identified

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Assessment**: We will investigate and validate the vulnerability within 7 days
3. **Resolution**: We will work on a fix and coordinate disclosure timing with you
4. **Credit**: With your permission, we will credit you in our security advisories

## Security Best Practices for Deployment

When deploying Hostzero Status, please follow these security best practices:

### Environment Variables

- **Never commit secrets** to version control
- Use strong, unique values for `PAYLOAD_SECRET` (32+ characters)
- Use secure passwords for database connections
- Store secrets in a secrets manager when possible

### Database

- Use strong database passwords
- Limit database network access to only the application
- Enable SSL/TLS for database connections in production
- Regularly backup your database

### Network Security

- Always use HTTPS in production
- Configure proper CORS settings for your domain
- Use a reverse proxy (nginx, Traefik) with security headers
- Consider using a Web Application Firewall (WAF)

### Access Control

- Use strong passwords for admin accounts
- Regularly rotate admin credentials
- Review user access periodically
- Enable audit logging if available

### Updates

- Keep Hostzero Status updated to the latest version
- Monitor dependencies for known vulnerabilities
- Subscribe to security advisories

### Docker Deployment

- Use specific image tags, not `latest` in production
- Run containers as non-root when possible
- Scan container images for vulnerabilities
- Use Docker secrets for sensitive data

## Known Security Considerations

### Public API Endpoints

The following endpoints are intentionally public:

- `GET /api/health` - Health check endpoint
- `POST /api/subscribe` - Public subscription (rate-limited)
- `POST /api/unsubscribe` - Unsubscribe via token

### Rate Limiting

- Subscription endpoint is rate-limited to 5 requests per IP per hour
- Rate limiting data is stored in the database for consistency across instances

### Sensitive Data Handling

- SMTP passwords and Twilio auth tokens are masked in API responses
- Unsubscribe tokens are used for one-click unsubscribe functionality
- IP addresses are stored for rate limiting purposes

## Security Updates

Security updates will be released as patch versions and announced through:

- GitHub Security Advisories
- Release notes
- Our security mailing list (if subscribed)

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged (with their permission) in our security advisories.

---

Thank you for helping keep Hostzero Status and its users safe!
