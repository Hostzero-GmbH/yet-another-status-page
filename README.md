# Hostzero Status

A modern, self-hosted status page built with [Payload CMS](https://payloadcms.com/) and [Next.js](https://nextjs.org/).

[![Docker Build](https://github.com/Hostzero-GmbH/status-page/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/Hostzero-GmbH/status-page/actions/workflows/docker-publish.yml)
[![Documentation](https://github.com/Hostzero-GmbH/status-page/actions/workflows/docs.yml/badge.svg)](https://hostzero-gmbh.github.io/status-page)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Incident Management** — Track and communicate service disruptions with timeline updates
- **Scheduled Maintenance** — Plan and notify users about upcoming maintenance windows
- **Email & SMS Notifications** — Automatic subscriber notifications via SMTP and Twilio
- **Service Groups** — Organize services into logical groups
- **Beautiful UI** — Modern, responsive status page with dark mode support
- **Self-Hosted** — Full control over your data and infrastructure
- **Docker Ready** — Easy deployment with Docker and Docker Compose

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Hostzero-GmbH/status-page.git
cd status-page

# Start the services
docker compose up -d
```

Visit:
- **Status Page**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## Documentation

📚 **[Full Documentation](https://hostzero-gmbh.github.io/status-page)**

- [Installation Guide](https://hostzero-gmbh.github.io/status-page/getting-started/installation/)
- [Configuration](https://hostzero-gmbh.github.io/status-page/getting-started/configuration/)
- [Admin Guide](https://hostzero-gmbh.github.io/status-page/admin/overview/)
- [API Reference](https://hostzero-gmbh.github.io/status-page/api/rest/)
- [Local Development](https://hostzero-gmbh.github.io/status-page/development/local-setup/)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| CMS | [Payload CMS 3.x](https://payloadcms.com/) |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Email | Nodemailer (SMTP) |
| SMS | Twilio |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on development setup, coding standards, and the pull request process.

## Security

For security concerns, please review our [Security Policy](SECURITY.md). Do not report security vulnerabilities through public GitHub issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
