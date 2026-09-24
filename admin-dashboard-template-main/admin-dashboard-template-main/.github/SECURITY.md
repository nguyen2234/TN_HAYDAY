# Security Policy

## Supported versions

Only the latest published release receives security fixes:

| Version            | Supported |
| ------------------ | --------- |
| latest release     | ✅        |
| older releases     | ❌        |

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's private vulnerability reporting:

1. Open the repository's **Security** tab.
2. Click **Report a vulnerability**.
3. Describe the issue, its impact, and reproduction steps.

Please do not open public issues, pull requests, or discussions for security reports.

## Scope notes

This project is a client-side admin dashboard **template**. The following are known design constraints of the demo, not vulnerabilities:

- Authentication is mocked via MSW; sessions are stored in `localStorage` and are not secure for real credentials.
- Role-based access control (RBAC) is enforced client-side only as a UI convenience.
- Real deployments must replace the mock layer with a real backend and enforce authentication and authorization server-side.

Reports about these documented behaviors will be closed as "works as intended" unless they reveal an issue beyond what is documented in [ARCHITECTURE.md](ARCHITECTURE.md).
