# Legal rule registry

This directory stores the officially sourced legal-metrology rule metadata in a machine-readable format.

## Source authority

- Department of Consumer Affairs, Government of India
- https://consumeraffairs.gov.in/pages/legal-metrology-act
- Legal Metrology Act, 2009
- Legal Metrology (Packaged Commodities) Rules, 2011
- applicable amendments and implementation advisories published by the Department of Consumer Affairs

## Rule format

Each rule record uses a structured object containing:

- id
- rule
- field
- description
- legalSource
- sourceURL
- effectiveFrom
- effectiveTo
- applicability
- requiredEvidence

This is not a legal text dump; it is a registry that the app can evaluate against the inspection date.

## Versioning

Rules are date-aware. When a rule has a future amendment or effective date, the engine checks the inspection date before applying it.
