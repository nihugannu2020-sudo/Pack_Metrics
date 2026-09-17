<div align="center">

  <h1>📦 PackMetrics</h1>
  <h3>Smart India Hackathon 2026 Grand Finale Submission</h3>
  <p><b>AI-Powered Compliance & Automated Enforcement System for the Legal Metrology (Packaged Commodities) Rules, 2011</b></p>

  <p>
    <img src="https://img.shields.io/badge/SIH-2026%20Grand%20Finale-orange?style=for-the-badge&logo=rocket" />
    <img src="https://img.shields.io/badge/Team-Candys%20(BMS%2FSIH2026%2F6)-blue?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Problem%20ID-26034-critical?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" />
  </p>

  <p>
    <a href="#-problem-statement">Problem Statement</a> •
    <a href="#-the-7-cycle-bottlenecks">The Challenge</a> •
    <a href="#-architectural-blueprint">Architecture</a> •
    <a href="#-core-technical-uniqueness">Technical Uniqueness</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

## 🎯 Problem Statement

| Metric | Details |
| :--- | :--- |
| **Competition** | Smart India Hackathon (SIH) 2026 |
| **Problem ID** | 26034 |
| **Theme & Category** | Miscellaneous / Software |
| **Team Identification** | Candys (Team ID: `BMS/SIH2026/6`) |
| **Official Statement** | *“Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.”* |

---

## 🛑 The 7 Cycle Bottlenecks for the Ministry

Traditional enforcement frameworks suffer from systemic operational failure, leaving regulatory bodies struggling to monitor modern markets:

1. **Manual Inspection Bottleneck:** Massive national shortfall in manpower allows the vast majority of retail goods to escape scrutiny.
2. **E-Commerce Compliance Blindspots:** Quick-commerce and digital storefronts bypass traditional field enforcement entirely.
3. **Inconsistent PDP Measurement:** Field officers relying on physical rulers cause subjective, error-prone enforcement easily contested in court.
4. **Multilingual Packaging Complexity:** Regional scripts and diverse typography slow down cross-state verification and inflate human error.
5. **Lack of Centralized Digital Evidence:** Fragmented, localized data silos prevent secure evidence sharing and tracking of repeat corporate offenders.
6. **Administrative Backlog:** Manual drafting of show-cause notices results in weeks of bureaucratic paralysis.
7. **Delayed Grievance Verification:** Consumer complaints routed via the National Consumer Helpline undergo slow physical field verification, eroding public trust.

---

## 🏗️ Architectural Blueprint

PackMetrics is architected around a high-concurrency microservices design, safely segregating heavy computer vision tasks from deterministic legal rule processing.

```mermaid
graph TD
    A[Client & Ingestion Layer <br> React.js / Flutter PWA] -->|HTTPS / JWT| B[Gateway & Security Layer <br> NGINX / OAuth 2.0]
    B --> C[Processing & Task Layer <br> FastAPI Microservices & Celery/Redis]
    C --> D[Core AI & Vision Pipeline <br> OpenCV, YOLOv8, PaddleOCR]
    C --> E[Deterministic Legal Engine <br> Abstract Syntax Tree Rules & Llama-3]
    D --> F[(Storage & Persistence <br> Supabase PostgreSQL & S3 Object Storage)]
    E --> F
