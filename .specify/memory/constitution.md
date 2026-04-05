<!--
Sync Impact Report (2026-04-04):
- Version: 1.0.0 → 1.1.0 (MINOR: Added documentation language principle)
- Modified principles:
  * Added V. Documentation Language (Traditional Chinese requirement)
- Previous version (1.0.0) included:
  * I. Code Quality Standards
  * II. Testing Discipline (NON-NEGOTIABLE)
  * III. User Experience Consistency
  * IV. Performance Requirements
- Templates requiring updates:
  ✅ spec-template.md - Already uses zh-TW for labels and guidance
  ✅ plan-template.md - Already uses zh-TW compatible structure
  ✅ tasks-template.md - Already uses zh-TW compatible structure
  ⚠️  Future specs/plans - Must be created in Traditional Chinese per new principle
- Follow-up: Ensure all future /speckit.specify and /speckit.plan outputs are in zh-TW
-->

# Lab 4 Constitution

## Core Principles

### I. Code Quality Standards

Every code contribution MUST maintain high quality standards to ensure long-term maintainability:

- **Readability First**: Code MUST be self-documenting with clear naming conventions and minimal complexity
- **Idiomatic Patterns**: Code MUST follow language-specific best practices and community conventions
- **No Magic**: Complex logic MUST be explained with comments; "clever" code is discouraged
- **Type Safety**: Strongly-typed languages MUST use strict type checking; dynamically-typed languages MUST include type hints where supported
- **Documentation**: Public APIs MUST include docstrings/documentation comments describing purpose, parameters, return values, and exceptions
- **Linting Compliance**: All code MUST pass configured linters with zero warnings before merge

**Rationale**: Quality code reduces bugs, accelerates onboarding, and enables confident refactoring. Technical debt compounds exponentially—preventing it at creation is vastly cheaper than fixing it later.

### II. Testing Discipline (NON-NEGOTIABLE)

Test-Driven Development is mandatory for all features:

- **Write Tests First**: Unit tests MUST be written and approved before implementation begins
- **Red-Green-Refactor**: Tests MUST fail initially, implementation makes them pass, then code is refactored
- **Coverage Requirements**: New code MUST achieve minimum 80% line coverage; critical paths require 100%
- **Test Levels Required**:
  - **Unit Tests**: All functions/methods with business logic
  - **Integration Tests**: All API endpoints, database interactions, third-party service integrations
  - **Contract Tests**: All public APIs and service boundaries
- **Test Quality**: Tests MUST be isolated, repeatable, and fast (<100ms per unit test)
- **No Skipped Tests**: Disabled tests MUST include a ticket reference and re-enablement deadline

**Rationale**: Tests are executable specifications that prevent regressions and enable fearless refactoring. Writing tests first forces design thinking about interfaces and edge cases before implementation lock-in.

### III. User Experience Consistency

All user-facing features MUST provide a consistent, predictable experience:

- **Design System**: UI components MUST use the established design system (colors, typography, spacing, components)
- **Interaction Patterns**: Similar actions MUST behave similarly across all features (e.g., save/cancel, error handling, loading states)
- **Accessibility**: MUST meet WCAG 2.1 Level AA standards (keyboard navigation, screen readers, color contrast)
- **Error Messages**: MUST be clear, actionable, and user-friendly (no stack traces or technical jargon to end users)
- **Loading States**: Any operation >200ms MUST show progress indication
- **Responsive Design**: UI MUST be functional on mobile (360px), tablet (768px), and desktop (1920px) viewports
- **User Testing**: Features affecting core workflows MUST undergo usability testing before release

**Rationale**: Consistency reduces cognitive load, builds user trust, and decreases support burden. Accessibility is both a legal requirement and moral imperative.

### IV. Performance Requirements

All features MUST meet defined performance standards:

- **Response Time**: API endpoints MUST respond within 200ms (p95) under normal load
- **Page Load**: Initial page render MUST complete within 1.5 seconds on 3G connection
- **Database Queries**: Individual queries MUST complete within 50ms; N+1 queries are forbidden
- **Memory Efficiency**: Services MUST operate within allocated memory limits; memory leaks are blocking issues
- **Scalability**: Features MUST be designed for 10x current load without architectural changes
- **Performance Testing**: Load tests MUST be included for any feature handling user-generated content or high-frequency operations
- **Monitoring**: All production code MUST emit performance metrics (latency, throughput, error rates)
- **Optimization**: Any degradation >20% from baseline MUST be investigated before merge

**Rationale**: Performance is a feature. Slow systems frustrate users, increase costs, and create competitive disadvantages. Performance issues are exponentially harder to fix after architectural decisions solidify.

### V. Documentation Language (NON-NEGOTIABLE)

All project documentation and specifications MUST be written in Traditional Chinese (zh-TW):

- **Specifications**: All feature specifications created via `/speckit.specify` MUST use Traditional Chinese for user stories, requirements, and descriptions
- **Planning Documents**: All implementation plans created via `/speckit.plan` MUST use Traditional Chinese for technical context, architecture decisions, and explanations
- **User-Facing Documentation**: README files, user guides, help text, and end-user documentation MUST be in Traditional Chinese
- **Code Comments**: Inline comments explaining business logic SHOULD use Traditional Chinese; technical implementation comments MAY use English when referencing international technical terminology
- **API Documentation**: Public API documentation MUST provide Traditional Chinese descriptions; English MAY be included as supplementary
- **Error Messages**: User-facing error messages MUST be in Traditional Chinese with clear, actionable guidance
- **Exceptions**: Internal technical documentation (e.g., architecture diagrams with standard notations, code variable/function names, git commit messages) MAY use English when industry-standard English terminology provides clarity

**Rationale**: Language consistency ensures all team members and stakeholders can effectively understand project requirements, design decisions, and user needs. Traditional Chinese is the primary language of the project stakeholders and end users, making it essential for requirements accuracy and stakeholder alignment.

## Quality Gates

All code contributions MUST pass these gates before merge:

1. **Constitution Compliance**: Feature design reviewed against all core principles
2. **Automated Checks Pass**: Linting, type checking, security scanning, tests (100% pass rate)
3. **Code Review Approval**: At least one team member review focusing on readability, design, and principle adherence
4. **Performance Validation**: Load tests pass, no regressions in benchmarks
5. **Documentation Complete**: README updates, API docs, migration guides (if breaking changes) - all in Traditional Chinese
6. **Accessibility Audit**: Automated a11y tests pass; manual testing for critical flows
7. **Language Compliance**: User-facing documentation and specifications in Traditional Chinese (zh-TW)

## Development Workflow

### Feature Development Process

1. **Specification** (`/speckit.specify`): Document user stories, requirements, test scenarios
2. **Planning** (`/speckit.plan`): Technical design, architecture decisions, constitution check
3. **Task Breakdown** (`/speckit.tasks`): Dependency-ordered implementation tasks
4. **Test-First Implementation**: Write tests → Get approval → Implement → Refactor
5. **Quality Validation**: Run full gate checklist before PR
6. **Review & Deploy**: Code review → Merge → Monitor production metrics

### Code Review Standards

Reviewers MUST verify:

- Constitution principle compliance (especially testing discipline and code quality)
- No complexity without justification (prefer simple solutions)
- Test coverage meets requirements and tests are meaningful
- Performance implications considered and measured
- Documentation updated, accurate, and in Traditional Chinese (for user-facing docs)
- Accessibility requirements met
- Language compliance for specifications and user-facing content

## Governance

This constitution supersedes all informal practices and serves as the authoritative reference for development standards.

**Amendment Process**:

- Proposed changes MUST include rationale, impact analysis, and migration plan
- MINOR version: Adding new principles or expanding existing guidance (backward-compatible)
- MAJOR version: Removing principles or incompatible redefinitions requiring existing code changes
- PATCH version: Clarifications, typo fixes, non-semantic improvements

**Compliance Enforcement**:

- All PRs MUST include constitution compliance checklist
- Violations MUST be justified in writing and approved by tech lead
- Persistent violations trigger retrospective and potential principle amendments

**Living Document**: This constitution is reviewed quarterly and amended as the project learns and evolves.

**Version**: 1.1.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
