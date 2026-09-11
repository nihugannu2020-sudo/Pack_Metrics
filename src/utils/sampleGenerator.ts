import { SampleLabelPreset, OCRWord } from '../types';

export const SAMPLE_PRESETS: SampleLabelPreset[] = [
  {
    id: 'sample-1-compliant',
    title: '1. Fully Compliant Label',
    subtitle: 'Standard Consumer Product',
    description: 'Contains all mandatory Rule 6 declarations: Manufacturer address, MRP, Net Qty, Mfg Date, Consumer Grievance Care, and PIN code.',
    badgeText: 'Expected: COMPLIANT (Pass All)',
    badgeType: 'pass',
    config: {
      productName: 'NutriCrunch Wheat Biscuits',
      manufacturer: 'Mfd by Apex Foods Pvt Ltd',
      address: '12 Industrial Area, Phase II, Bengaluru, Karnataka',
      pin: '560058',
      netQty: '250 g',
      mrp: '₹ 45.00',
      inclusiveOfTaxes: true,
      mfgDate: 'MFG: AUG 2026',
      consumerCarePhone: '+91 9876543210',
      consumerCareEmail: 'care@apexfoods.in',
      isImported: false,
      style: 'standard',
    },
  },
  {
    id: 'sample-2-missing-mrp',
    title: '2. Non-Compliant (Missing MRP)',
    subtitle: 'Rule 6(1)(e) Violation',
    description: 'Omits the Maximum Retail Price declaration entirely, violating Section 18(2) of the Legal Metrology Act.',
    badgeText: 'Expected: VIOLATION (Missing MRP)',
    badgeType: 'fail',
    config: {
      productName: 'Royal Spice Cardamom 50g',
      manufacturer: 'Mfd by Himalayan Spices Co',
      address: 'Plot 45, Sector 3, Shimla, HP',
      pin: '171001',
      netQty: '50 g',
      mrp: '', // Omitted
      inclusiveOfTaxes: false,
      mfgDate: 'MFG: 07/2026',
      consumerCarePhone: '9812345678',
      consumerCareEmail: 'support@himalayanspices.com',
      isImported: false,
      style: 'missing_mrp',
    },
  },
  {
    id: 'sample-3-missing-care-date',
    title: '3. Non-Compliant (Multiple Failures)',
    subtitle: 'Rule 6(1)(d) & Rule 6(1)(f) Violation',
    description: 'Lacks both Consumer Care grievance contacts (phone/email) and the mandatory Month/Year of Manufacturing.',
    badgeText: 'Expected: VIOLATION (2 Failures)',
    badgeType: 'fail',
    config: {
      productName: 'PureFlow Mineral Water 1L',
      manufacturer: 'Packed by AquaClear Springs',
      address: 'Industrial Estate, Pune, Maharashtra',
      pin: '411018',
      netQty: '1 L',
      mrp: 'Rs. 20.00',
      inclusiveOfTaxes: true,
      mfgDate: '', // Omitted
      consumerCarePhone: '', // Omitted
      consumerCareEmail: '', // Omitted
      isImported: false,
      style: 'missing_care_mfg',
    },
  },
  {
    id: 'sample-4-bilingual-hindi',
    title: '4. Multilingual Label (Eng + Hin)',
    subtitle: 'Demonstrates Hindi OCR Capability',
    description: 'Includes Hindi script product declarations alongside English text (e.g., "स्वादिष्ट बिस्कुट"). Fully compliant.',
    badgeText: 'Expected: COMPLIANT (Bilingual)',
    badgeType: 'pass',
    config: {
      productName: 'Desi Ghee Cookies',
      bilingualHindi: 'स्वादिष्ट देसी घी बिस्कुट',
      manufacturer: 'Manufactured by Bharat Dairy Products',
      address: 'GIDC Estate, Anand, Gujarat',
      pin: '388001',
      netQty: '400 g',
      mrp: '₹ 180.00',
      inclusiveOfTaxes: true,
      mfgDate: 'MFG: 08/2026',
      consumerCarePhone: '9426012345',
      consumerCareEmail: 'grievance@bharatdairy.in',
      isImported: false,
      style: 'bilingual',
    },
  },
  {
    id: 'sample-5-ecommerce-style',
    title: '5. E-Commerce Listing Card',
    subtitle: 'Dark Store / Online Listing Blindspot',
    description: 'Digital listing screenshot missing physical manufacturer address & PIN code, highlighting e-commerce compliance gaps.',
    badgeText: 'Expected: VIOLATION (No Address)',
    badgeType: 'fail',
    config: {
      productName: 'Organic Green Tea Bags (100 Pack)',
      manufacturer: 'Marketed by EcoBlend India',
      address: '', // Omitted physical address
      pin: '', // Omitted PIN code
      netQty: '100 units (150 g)',
      mrp: '₹ 349.00',
      inclusiveOfTaxes: true,
      mfgDate: 'MFG: JUN 2026',
      consumerCarePhone: '9900112233',
      consumerCareEmail: 'help@ecoblend.in',
      isImported: false,
      style: 'ecommerce',
    },
  },
];

/**
 * Draws a clean, synthetic packaged product label onto an HTML5 Canvas and converts to Data URL.
 */
export function generateCanvasLabel(preset: SampleLabelPreset): { dataUrl: string; width: number; height: number; text: string; words: OCRWord[] } {
  const canvas = document.createElement('canvas');
  const width = 600;
  const height = 440;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const { config } = preset;

  // Background
  if (config.style === 'ecommerce') {
    // E-commerce card background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Header bar
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(0, 0, width, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('E-COMMERCE PRODUCT SPECIFICATION CARD', 20, 32);

    // Border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, width - 4, height - 4);
  } else {
    // Standard label container with border
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#0B1F3A';
    ctx.fillRect(0, 0, width, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('STATUTORY MANDATORY DECLARATIONS — LEGAL METROLOGY', 20, 26);

    ctx.strokeStyle = '#0B1F3A';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, width - 16, height - 16);
  }

  const words: OCRWord[] = [];
  const textLines: string[] = [];

  let currentY = 80;

  // Helper to record line and compute approximate word bounding boxes for instant demo display
  const drawTextLine = (text: string, font: string, color: string, x: number = 30) => {
    if (!text) return;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, currentY);

    textLines.push(text);

    // Compute synthetic word boxes for OCR alignment overlay
    const splitWords = text.split(/\s+/);
    let currentX = x;

    splitWords.forEach(w => {
      const metrics = ctx.measureText(w + ' ');
      const wordWidth = ctx.measureText(w).width;
      
      words.push({
        text: w,
        bbox: {
          x0: Math.round(currentX),
          y0: Math.round(currentY - 18),
          x1: Math.round(currentX + wordWidth),
          y1: Math.round(currentY + 4),
        },
        confidence: 99,
      });

      currentX += metrics.width;
    });

    currentY += 32;
  };

  // Product Name
  drawTextLine(config.productName, 'bold 24px Inter, sans-serif', '#0B1F3A');

  // Hindi text if bilingual
  if (config.bilingualHindi) {
    drawTextLine(config.bilingualHindi, 'bold 20px Inter, sans-serif', '#F26B21');
  }

  currentY += 10;
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, currentY - 20);
  ctx.lineTo(width - 30, currentY - 20);
  ctx.stroke();

  // Manufacturer Details
  if (config.manufacturer) {
    drawTextLine(config.manufacturer, '16px Inter, sans-serif', '#1E293B');
  }
  if (config.address) {
    drawTextLine(`${config.address} - ${config.pin}`, '15px Inter, sans-serif', '#334155');
  }

  // Net Quantity
  if (config.netQty) {
    drawTextLine(`NET QUANTITY: ${config.netQty}`, 'bold 18px Inter, sans-serif', '#0B1F3A');
  }

  // MRP
  if (config.mrp) {
    const taxSuffix = config.inclusiveOfTaxes ? ' (inclusive of all taxes)' : '';
    drawTextLine(`MRP: ${config.mrp}${taxSuffix}`, 'bold 18px Inter, sans-serif', '#16A34A');
  }

  // Mfg Date
  if (config.mfgDate) {
    drawTextLine(config.mfgDate, '16px Inter, sans-serif', '#1E293B');
  }

  // Consumer Care
  if (config.consumerCarePhone || config.consumerCareEmail) {
    const careText = `Consumer Grievance Cell: ${config.consumerCarePhone} | ${config.consumerCareEmail}`;
    drawTextLine(careText, '14px Inter, sans-serif', '#475569');
  }

  const dataUrl = canvas.toDataURL('image/png');
  const fullText = textLines.join('\n');

  return {
    dataUrl,
    width,
    height,
    text: fullText,
    words,
  };
}
