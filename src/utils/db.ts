import type { ComplianceReport, LegalNotice, AppUser, UserRole } from '../types';

const STORAGE_KEYS = {
  SCANS: 'packmetrics_scans_v2',
  NOTICES: 'packmetrics_notices_v2',
  USER_ROLE: 'packmetrics_user_role_v2',
  USER_NAME: 'packmetrics_user_name_v2',
  USERS: 'packmetrics_users_v1',
};

const REMOVED_DEMO_SCAN_IDS = new Set(['SCAN-1789318422504-776']);
const REMOVED_DEMO_NOTICE_NUMBERS = new Set(['PM-546175', 'PM-682495']);

function isNoisyOcrScan(scan: ComplianceReport): boolean {
  const productName = scan.productName.trim().toLowerCase();
  const manufacturerName = scan.manufacturerName.trim().toLowerCase();
  return productName.includes('re tite')
    || productName === '== | b®'
    || manufacturerName === 'detected manufacturer';
}

const INITIAL_SEED_SCANS: ComplianceReport[] = [];
const INITIAL_SEED_NOTICES: LegalNotice[] = [];

export const DB = {
  getScans(): ComplianceReport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(INITIAL_SEED_SCANS));
      return INITIAL_SEED_SCANS;
    }
    try {
      const scans = JSON.parse(raw) as ComplianceReport[];
      const filteredScans = scans.filter(scan => !REMOVED_DEMO_SCAN_IDS.has(scan.id) && !isNoisyOcrScan(scan));
      if (filteredScans.length !== scans.length) {
        localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(filteredScans));
      }
      return filteredScans;
    } catch {
      return INITIAL_SEED_SCANS;
    }
  },

  saveScan(scan: ComplianceReport): void {
    const scans = this.getScans();
    const updated = [scan, ...scans];
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(updated));
  },

  updateScan(scan: ComplianceReport): void {
    const scans = this.getScans();
    const updated = scans.map(existingScan => (existingScan.id === scan.id ? scan : existingScan));
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(updated));
  },

  updateScanReview(
    scanId: string,
    review: Pick<ComplianceReport, 'reviewStatus' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>
  ): void {
    const scans = this.getScans();
    const updated = scans.map(scan => (scan.id === scanId ? { ...scan, ...review } : scan));
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(updated));
  },

  getNotices(): LegalNotice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_SEED_NOTICES));
      return INITIAL_SEED_NOTICES;
    }
    try {
      const notices = JSON.parse(raw) as LegalNotice[];
      const filteredNotices = notices.filter(notice => !REMOVED_DEMO_NOTICE_NUMBERS.has(notice.noticeNumber));
      if (filteredNotices.length !== notices.length) {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(filteredNotices));
      }
      return filteredNotices;
    } catch {
      return INITIAL_SEED_NOTICES;
    }
  },

  saveNotice(notice: LegalNotice): void {
    const notices = this.getNotices();
    const updated = [notice, ...notices];
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
  },

  updateNoticeStatus(noticeId: string, status: 'Open' | 'Acknowledged' | 'Dismissed'): void {
    const notices = this.getNotices();
    const updated = notices.map(n => (n.id === noticeId ? { ...n, status } : n));
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
  },

  getUserRole(): 'inspector' | 'manufacturer' | 'admin' {
    return (localStorage.getItem(STORAGE_KEYS.USER_ROLE) as any) || 'inspector';
  },

  setUserRole(role: 'inspector' | 'manufacturer' | 'admin'): void {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  },

  getUserName(): string {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME) || 'Inspector Rajesh Kumar';
  },

  setUserName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  getUsers(): AppUser[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as AppUser[];
    } catch {
      return [];
    }
  },

  logUserActivity(role: UserRole, name: string, organization: string): void {
    const users = this.getUsers();
    const id = `${role}-${name}-${organization}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const existingIndex = users.findIndex(u => u.id === id);
    if (existingIndex >= 0) {
      users[existingIndex].lastLogin = new Date().toISOString();
      users[existingIndex].activityCount += 1;
    } else {
      users.push({
        id,
        name,
        role,
        organization,
        lastLogin: new Date().toISOString(),
        activityCount: 1,
      });
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
};
