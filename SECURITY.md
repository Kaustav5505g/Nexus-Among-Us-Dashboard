# Security Policy

## Official Maintainers & Security Leads
The NEXUS Among Us & Tech Mystery Dashboard is strictly maintained by:
- **Tejas Narula** ([@Tejas-Narula](https://github.com/Tejas-Narula)) — Lead Maintainer & Systems Architect
- **synthreaper** ([@synthreaper](https://github.com/synthreaper)) — Security & Core Operations

All pull requests, security patches, environment variable changes, and database modifications **must be approved by @Tejas-Narula or @synthreaper**.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability or unauthorized access risk in the NEXUS Dashboard:

1. **Do not create a public GitHub issue.**
2. Report the vulnerability privately to:
   - GitHub Security Advisory: Submit via GitHub repository Private Vulnerability Reporting.
   - Or contact `@Tejas-Narula` or `@synthreaper` directly via official club channels.
3. Include details of the vulnerability, steps to reproduce, and impact assessment.
4. The security leads will acknowledge receipt within 24 hours and coordinate a patch before public disclosure.

## Architectural Security Rules for Contributors & AI Agents
1. **No Fragmented Database Migrations**: Never introduce fragmented SQL scripts or split schemas. The entire database specification resides in the single unified file `supabase/schema.sql`.
2. **No Hardcoded Credentials**: API secrets, Supabase service roles, and private tokens must never be hardcoded into frontend or backend source files.
3. **No Unauthorized Commits**: Automated agents must never push directly to `main` without review.
