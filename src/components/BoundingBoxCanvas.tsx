import React, { useEffect, useRef } from 'react';
import type { ComplianceReport } from '../types';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface BoundingBoxCanvasProps {
  report: ComplianceReport | null;
  isScanning: boolean;
}

export const BoundingBoxCanvas: React.FC<BoundingBoxCanvasProps> = ({ report, isScanning }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!report || !report.imageUrl || !canvasRef.current || !imgRef.current) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleDraw = () => {
      const displayWidth = img.clientWidth;
      const displayHeight = img.clientHeight;

      if (displayWidth === 0 || displayHeight === 0) return;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const scaleX = displayWidth / (img.naturalWidth || displayWidth);
      const scaleY = displayHeight / (img.naturalHeight || displayHeight);

      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Draw bounding boxes for matched rules
      report.results.forEach(result => {
        if (result.status === 'pass' && result.matchedBboxes && result.matchedBboxes.length > 0) {
          result.matchedBboxes.forEach(bbox => {
            const x = bbox.x0 * scaleX;
            const y = bbox.y0 * scaleY;
            const w = (bbox.x1 - bbox.x0) * scaleX;
            const h = (bbox.y1 - bbox.y0) * scaleY;

            // Box Fill
            ctx.fillStyle = 'rgba(22, 163, 74, 0.20)';
            ctx.fillRect(x, y, w, h);

            // Box Border
            ctx.strokeStyle = '#16A34A';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            // Small badge text label
            ctx.fillStyle = '#16A34A';
            ctx.fillRect(x, Math.max(0, y - 16), Math.max(45, ctx.measureText(result.legalRef).width + 8), 16);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillText(result.legalRef, x + 4, Math.max(11, y - 4));
          });
        }
      });
    };

    if (img.complete) {
      handleDraw();
    } else {
      img.onload = handleDraw;
    }

    window.addEventListener('resize', handleDraw);
    return () => window.removeEventListener('resize', handleDraw);
  }, [report]);

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-navy-50/50 rounded-xl border-2 border-dashed border-navy-100 p-8 text-center animate-pulse">
        <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mb-4"></div>
        <h4 className="font-semibold text-navy-900 text-lg">Running Optical Character Recognition</h4>
        <p className="text-sm text-slate-600 mt-1">Analyzing package typography & validating against Legal Metrology Rules 2011...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mb-4 text-navy-900">
          <ShieldAlert className="w-8 h-8 text-saffron" />
        </div>
        <h4 className="font-semibold text-navy-900 text-lg">No Package Selected</h4>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Select a sample preset label from the gallery on the left or upload a package photo to analyze compliance.
        </p>
      </div>
    );
  }

  const failedRules = report.results.filter(r => r.status === 'fail');

  return (
    <div className="flex flex-col space-y-4">
      {/* Visual Canvas Overlay Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy-900 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-compliant inline-block"></span>
            Extracted Text & Bounding Box Overlay
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {report.results.filter(r => r.status === 'pass').length} Matches Visualized
          </span>
        </div>

        <div ref={containerRef} className="relative overflow-hidden rounded-lg bg-slate-900 flex justify-center items-center min-h-[320px] max-h-[460px]">
          {report.imageUrl ? (
            <>
              <img
                ref={imgRef}
                src={report.imageUrl}
                alt="Packaged Label"
                className="max-h-[460px] w-auto object-contain block"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </>
          ) : (
            <div className="text-white text-sm p-6 text-center">
              No image preview available for this historical record.
            </div>
          )}
        </div>
      </div>

      {/* Red Badges for Missing Declarations (No bounding coordinates) */}
      {failedRules.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-violation font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Missing Statutory Declarations ({failedRules.length} Required Items Missing)</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            The following mandatory declarations were not detected anywhere in the package text OCR:
          </p>
          <div className="flex flex-wrap gap-2">
            {failedRules.map(rule => (
              <div
                key={rule.ruleId}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-100/80 border border-red-300 rounded-lg text-xs text-red-900 font-medium"
              >
                <span className="bg-violation text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                  {rule.legalRef}
                </span>
                <span>{rule.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {failedRules.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900 text-sm">
          <CheckCircle className="w-5 h-5 text-compliant flex-shrink-0" />
          <div>
            <span className="font-semibold">All Mandatory Bounding Boxes Identified!</span>
            <p className="text-xs text-emerald-700 mt-0.5">
              Every mandatory declaration specified under Rule 6 of the Packaged Commodities Rules 2011 was successfully located.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
