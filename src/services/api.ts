import type { ComplianceReport, LegalNotice } from '../types';

const API_URL = 'http://localhost:8001/api';

export const API = {
  async getScans(): Promise<ComplianceReport[]> {
    const res = await fetch(`${API_URL}/scans`);
    return res.json();
  },

  async runOCR(imageUrl: string): Promise<{text: string, words: any[]}> {
    const res = await fetch(`${API_URL}/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    return res.json();
  },

  async getExplanations(report: ComplianceReport): Promise<Record<string, string>> {
    const res = await fetch(`${API_URL}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: report.results, extractedText: report.extractedText }),
    });
    return res.json();
  },

  async saveScan(scan: ComplianceReport): Promise<ComplianceReport> {
    const res = await fetch(`${API_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scan),
    });
    return res.json();
  },

  async updateScanReview(scanId: string, review: any): Promise<ComplianceReport> {
    const res = await fetch(`${API_URL}/scans/${scanId}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return res.json();
  },

  async getNotices(): Promise<LegalNotice[]> {
    const res = await fetch(`${API_URL}/notices`);
    return res.json();
  },

  async saveNotice(notice: LegalNotice): Promise<LegalNotice> {
    const res = await fetch(`${API_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });
    return res.json();
  },

  async updateNoticeStatus(noticeId: string, status: string): Promise<LegalNotice> {
    const res = await fetch(`${API_URL}/notices/${noticeId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  }
};
