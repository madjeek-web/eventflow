# Security Policy

## Supported Versions

The following versions of EventFlow receive security updates.

| Version | Supported |
|---|---|
| 1.x (current) | Yes |
| Earlier versions | No |

---

## Reporting a Vulnerability

If you discover a security vulnerability in EventFlow, please do not open a public GitHub issue. Public disclosure before a fix is ready puts all users at risk.

Instead, report it privately by opening a [GitHub Security Advisory](https://github.com/madjeek-web/eventflow/security/advisories/new) on this repository. This channel is encrypted and visible only to maintainers.

Please include in your report :

- A clear description of the vulnerability
- The affected component or file
- Steps to reproduce the issue
- The potential impact if exploited
- Your suggested fix, if you have one

---

## Response Timeline

| Step | Target time |
|---|---|
| Acknowledgement of your report | Within 48 hours |
| Assessment and severity classification | Within 5 business days |
| Patch or mitigation available | Depends on severity |
| Public disclosure (coordinated) | After patch is released |

---

## Known Security Architecture Decisions

The following decisions are intentional and documented here to avoid confusion with genuine vulnerabilities.

**JSON file data layer**

The application stores data in JSON files. This is a deliberate choice for portability in development and demonstration contexts. It does not represent a vulnerability in itself, but it is not suitable for multi-instance production deployments due to concurrent write limitations. See `docs/architecture.md` for migration guidance.

**Rate limiting is in-memory**

The login rate limiter uses an in-memory store. This is sufficient for single-instance deployments. In a clustered deployment, use a shared store such as Redis. This limitation is documented in `src/lib/rateLimit.js`.

---

## Security Practices in This Codebase

For a full overview of the security mechanisms implemented in this project, see the [Security Overview](README.md#security-overview) section in the README.

---

## Credits

Security researchers who responsibly disclose vulnerabilities will be credited in the release notes of the patch, with their permission.
