import type { ComplianceReport, LegalNotice } from '../types';

const STORAGE_KEYS = {
  SCANS: 'packmetrics_scans_v1',
  NOTICES: 'packmetrics_notices_v1',
  USER_ROLE: 'packmetrics_user_role_v1',
  USER_NAME: 'packmetrics_user_name_v1',
};

// Seed historical scan data for rich demo metrics
const INITIAL_SEED_SCANS: ComplianceReport[] = [
  {
    id: 'SCAN-1001',
    timestamp: '2026-09-01T10:15:00.000Z',
    productName: 'NutriCrunch Wheat Biscuits',
    manufacturerName: 'Apex Foods Pvt Ltd',
    isImported: false,
    imageUrl: '',
    extractedText: 'Mfd by Apex Foods Pvt Ltd, 12 Industrial Area, Bengaluru - 560058. NET QTY: 250 g. MRP ₹ 45.00 inclusive of all taxes. MFG: AUG 2026. Care: care@apexfoods.in',
    words: [],
    results: [
      { ruleId: 'MANUFACTURER_ADDRESS', legalRef: 'Rule 6(1)(a)', title: 'Name & address', status: 'pass', matchedText: 'Mfd by Apex Foods Pvt Ltd 560058', matchedBboxes: [] },
      { ruleId: 'COMMODITY_NAME', legalRef: 'Rule 6(1)(b)', title: 'Generic commodity name', status: 'pass', matchedText: 'NutriCrunch Wheat Biscuits', matchedBboxes: [] },
      { ruleId: 'NET_QUANTITY', legalRef: 'Rule 6(1)(c) & Rule 5', title: 'Net quantity', status: 'pass', matchedText: '250 g', matchedBboxes: [], guidanceNote: 'Net Qty 200g-500g → Min height ≥ 2mm' },
      { ruleId: 'MRP', legalRef: 'Rule 6(1)(e)', title: 'Maximum Retail Price', status: 'pass', matchedText: '₹ 45.00', matchedBboxes: [] },
      { ruleId: 'MFG_DATE', legalRef: 'Rule 6(1)(d)', title: 'Month & year of mfg', status: 'pass', matchedText: 'AUG 2026', matchedBboxes: [] },
      { ruleId: 'CONSUMER_CARE', legalRef: 'Rule 6(1)(f)', title: 'Grievance contact', status: 'pass', matchedText: 'care@apexfoods.in', matchedBboxes: [] },
      { ruleId: 'COUNTRY_OF_ORIGIN', legalRef: 'Rule 6(1)', title: 'Country of origin', status: 'pass', matchedText: 'Domestic', matchedBboxes: [] },
    ],
    passCount: 7,
    failCount: 0,
    reviewCount: 0,
    overallStatus: 'Compliant',
  },
  {
    id: 'SCAN-1002',
    timestamp: '2026-09-03T14:30:00.000Z',
    productName: 'Royal Spice Cardamom 50g',
    manufacturerName: 'Himalayan Spices Co',
    isImported: false,
    imageUrl: '',
    extractedText: 'Mfd by Himalayan Spices Co, Shimla 171001. NET QTY: 50 g. MFG: 07/2026. Care: 9812345678',
    words: [],
    results: [
      { ruleId: 'MANUFACTURER_ADDRESS', legalRef: 'Rule 6(1)(a)', title: 'Name & address', status: 'pass', matchedText: 'Himalayan Spices 171001', matchedBboxes: [] },
      { ruleId: 'COMMODITY_NAME', legalRef: 'Rule 6(1)(b)', title: 'Generic commodity name', status: 'pass', matchedText: 'Royal Spice Cardamom', matchedBboxes: [] },
      { ruleId: 'NET_QUANTITY', legalRef: 'Rule 6(1)(c) & Rule 5', title: 'Net quantity', status: 'pass', matchedText: '50 g', matchedBboxes: [] },
      { ruleId: 'MRP', legalRef: 'Rule 6(1)(e)', title: 'Maximum Retail Price', status: 'fail', matchedBboxes: [] },
      { ruleId: 'MFG_DATE', legalRef: 'Rule 6(1)(d)', title: 'Month & year of mfg', status: 'pass', matchedText: '07/2026', matchedBboxes: [] },
      { ruleId: 'CONSUMER_CARE', legalRef: 'Rule 6(1)(f)', title: 'Grievance contact', status: 'pass', matchedText: '9812345678', matchedBboxes: [] },
      { ruleId: 'COUNTRY_OF_ORIGIN', legalRef: 'Rule 6(1)', title: 'Country of origin', status: 'pass', matchedText: 'Domestic', matchedBboxes: [] },
    ],
    passCount: 6,
    failCount: 1,
    reviewCount: 0,
    overallStatus: 'Non-Compliant',
  },
  {
    id: 'SCAN-1003',
    timestamp: '2026-09-05T09:45:00.000Z',
    productName: 'PureFlow Mineral Water 1L',
    manufacturerName: 'AquaClear Springs',
    isImported: false,
    imageUrl: '',
    extractedText: 'Packed by AquaClear Springs, Pune 411018. NET QTY: 1 L. MRP: Rs 20.00',
    words: [],
    results: [
      { ruleId: 'MANUFACTURER_ADDRESS', legalRef: 'Rule 6(1)(a)', title: 'Name & address', status: 'pass', matchedText: 'AquaClear 411018', matchedBboxes: [] },
      { ruleId: 'COMMODITY_NAME', legalRef: 'Rule 6(1)(b)', title: 'Generic commodity name', status: 'pass', matchedText: 'Mineral Water', matchedBboxes: [] },
      { ruleId: 'NET_QUANTITY', legalRef: 'Rule 6(1)(c) & Rule 5', title: 'Net quantity', status: 'pass', matchedText: '1 L', matchedBboxes: [] },
      { ruleId: 'MRP', legalRef: 'Rule 6(1)(e)', title: 'Maximum Retail Price', status: 'pass', matchedText: 'Rs 20.00', matchedBboxes: [] },
      { ruleId: 'MFG_DATE', legalRef: 'Rule 6(1)(d)', title: 'Month & year of mfg', status: 'fail', matchedBboxes: [] },
      { ruleId: 'CONSUMER_CARE', legalRef: 'Rule 6(1)(f)', title: 'Grievance contact', status: 'fail', matchedBboxes: [] },
      { ruleId: 'COUNTRY_OF_ORIGIN', legalRef: 'Rule 6(1)', title: 'Country of origin', status: 'pass', matchedText: 'Domestic', matchedBboxes: [] },
    ],
    passCount: 5,
    failCount: 2,
    reviewCount: 0,
    overallStatus: 'Non-Compliant',
  },
  {
    id: 'SCAN-1004',
    timestamp: '2026-09-07T11:20:00.000Z',
    productName: 'Desi Ghee Cookies',
    manufacturerName: 'Bharat Dairy Products',
    isImported: false,
    imageUrl: '',
    extractedText: 'Manufactured by Bharat Dairy Products, Anand 388001. NET QTY: 400 g. MRP ₹ 180.00. MFG: 08/2026. Care: 9426012345',
    words: [],
    results: [
      { ruleId: 'MANUFACTURER_ADDRESS', legalRef: 'Rule 6(1)(a)', title: 'Name & address', status: 'pass', matchedText: 'Bharat Dairy 388001', matchedBboxes: [] },
      { ruleId: 'COMMODITY_NAME', legalRef: 'Rule 6(1)(b)', title: 'Generic commodity name', status: 'pass', matchedText: 'Desi Ghee Cookies', matchedBboxes: [] },
      { ruleId: 'NET_QUANTITY', legalRef: 'Rule 6(1)(c) & Rule 5', title: 'Net quantity', status: 'pass', matchedText: '400 g', matchedBboxes: [] },
      { ruleId: 'MRP', legalRef: 'Rule 6(1)(e)', title: 'Maximum Retail Price', status: 'pass', matchedText: '₹ 180.00', matchedBboxes: [] },
      { ruleId: 'MFG_DATE', legalRef: 'Rule 6(1)(d)', title: 'Month & year of mfg', status: 'pass', matchedText: '08/2026', matchedBboxes: [] },
      { ruleId: 'CONSUMER_CARE', legalRef: 'Rule 6(1)(f)', title: 'Grievance contact', status: 'pass', matchedText: '9426012345', matchedBboxes: [] },
      { ruleId: 'COUNTRY_OF_ORIGIN', legalRef: 'Rule 6(1)', title: 'Country of origin', status: 'pass', matchedText: 'Domestic', matchedBboxes: [] },
    ],
    passCount: 7,
    failCount: 0,
    reviewCount: 0,
    overallStatus: 'Compliant',
  },
  {
    id: 'SCAN-1005',
    timestamp: '2026-09-09T16:10:00.000Z',
    productName: 'Organic Green Tea Bags (100 Pack)',
    manufacturerName: 'EcoBlend India',
    isImported: false,
    imageUrl: '',
    extractedText: 'Marketed by EcoBlend India. NET QTY: 100 units. MRP ₹ 349.00. MFG: JUN 2026. Care: 9900112233',
    words: [],
    results: [
      { ruleId: 'MANUFACTURER_ADDRESS', legalRef: 'Rule 6(1)(a)', title: 'Name & address', status: 'fail', matchedBboxes: [] },
      { ruleId: 'COMMODITY_NAME', legalRef: 'Rule 6(1)(b)', title: 'Generic commodity name', status: 'pass', matchedText: 'Organic Green Tea', matchedBboxes: [] },
      { ruleId: 'NET_QUANTITY', legalRef: 'Rule 6(1)(c) & Rule 5', title: 'Net quantity', status: 'pass', matchedText: '100 units', matchedBboxes: [] },
      { ruleId: 'MRP', legalRef: 'Rule 6(1)(e)', title: 'Maximum Retail Price', status: 'pass', matchedText: '₹ 349.00', matchedBboxes: [] },
      { ruleId: 'MFG_DATE', legalRef: 'Rule 6(1)(d)', title: 'Month & year of mfg', status: 'pass', matchedText: 'JUN 2026', matchedBboxes: [] },
      { ruleId: 'CONSUMER_CARE', legalRef: 'Rule 6(1)(f)', title: 'Grievance contact', status: 'pass', matchedText: '9900112233', matchedBboxes: [] },
      { ruleId: 'COUNTRY_OF_ORIGIN', legalRef: 'Rule 6(1)', title: 'Country of origin', status: 'pass', matchedText: 'Domestic', matchedBboxes: [] },
    ],
    passCount: 6,
    failCount: 1,
    reviewCount: 0,
    overallStatus: 'Non-Compliant',
  },
];

const INITIAL_SEED_NOTICES: LegalNotice[] = [
  {
    id: 'NOT-2001',
    noticeNumber: 'PM-841920',
    scanId: 'SCAN-1002',
    date: '03 Sep 2026',
    manufacturerName: 'Himalayan Spices Co',
    manufacturerAddress: 'Plot 45, Sector 3, Shimla, HP 171001',
    productName: 'Royal Spice Cardamom 50g',
    violations: [{ legalRef: 'Rule 6(1)(e)', title: 'Maximum Retail Price, inclusive of all taxes, to 2 decimal places' }],
    status: 'Open',
    issuedBy: 'Inspector R. Sharma',
  },
  {
    id: 'NOT-2002',
    noticeNumber: 'PM-391024',
    scanId: 'SCAN-1003',
    date: '05 Sep 2026',
    manufacturerName: 'AquaClear Springs',
    manufacturerAddress: 'Industrial Estate, Pune, Maharashtra 411018',
    productName: 'PureFlow Mineral Water 1L',
    violations: [
      { legalRef: 'Rule 6(1)(d)', title: 'Month & year of manufacture / packing / import' },
      { legalRef: 'Rule 6(1)(f)', title: 'Name, address, phone & email for consumer grievances' },
    ],
    status: 'Acknowledged',
    issuedBy: 'Inspector A. Verma',
  },
  {
    id: 'NOT-2003',
    noticeNumber: 'PM-712839',
    scanId: 'SCAN-1005',
    date: '09 Sep 2026',
    manufacturerName: 'EcoBlend India',
    manufacturerAddress: 'Address Unidentified / Missing on PDP',
    productName: 'Organic Green Tea Bags (100 Pack)',
    violations: [{ legalRef: 'Rule 6(1)(a)', title: 'Name & complete address of manufacturer / packer / importer' }],
    status: 'Open',
    issuedBy: 'Inspector R. Sharma',
  },
];

export const DB = {
  getScans(): ComplianceReport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(INITIAL_SEED_SCANS));
      return INITIAL_SEED_SCANS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SEED_SCANS;
    }
  },

  saveScan(scan: ComplianceReport): void {
    const scans = this.getScans();
    const updated = [scan, ...scans];
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
      return JSON.parse(raw);
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
};
