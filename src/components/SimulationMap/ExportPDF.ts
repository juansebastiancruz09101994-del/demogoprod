import { NodeData, ReportData } from "./types";

const fmt = (n: number | undefined, decimals = 0): string => {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const fmtMoney = (n: number | undefined): string => {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

interface ExtractedData {
  target: number;
  totalMP: number;
  mpRate: number;
  packUnits: number;
  packRatio: number;
  totalHours: number;
  laborRate: number;
  workersReq: number;
  hrsPerWorker: number;
  hires: number;
  currentWorkers: number;
  matCost: number;
  matPrice: number;
  labCost: number;
  wage: number;
  packCost: number;
  fixCost: number;
  discCost: number;
  totalCost: number;
  unitCost: number;
  unitsProduced: number;
}

function extractData(nodes: NodeData[]): ExtractedData {
  const get = (type: string, field: string): number => {
    const node = nodes.find((n) => n.type === type);
    return node?.data?.[field] ?? 0;
  };

  return {
    target: get("production_target", "target"),
    totalMP: get("material_needs", "total_mp"),
    mpRate: get("material_needs", "rate"),
    packUnits: get("packaging", "pack_units"),
    packRatio: get("packaging", "ratio"),
    totalHours: get("labor_needs", "total_hours"),
    laborRate: get("labor_needs", "rate"),
    workersReq: get("workforce", "workers_req"),
    hrsPerWorker: get("workforce", "hrs_per_worker"),
    hires: get("hiring", "hires"),
    currentWorkers: get("hiring", "current"),
    matCost: get("cost_material", "cost"),
    matPrice: get("cost_material", "price"),
    labCost: get("cost_labor", "cost"),
    wage: get("cost_labor", "wage"),
    packCost: get("cost_packaging", "cost"),
    fixCost: get("total_cost", "fix_cost"),
    discCost: get("total_cost", "disc_cost"),
    totalCost: get("total_cost", "total"),
    unitCost: get("unit_cost", "u_cost"),
    unitsProduced: get("unit_cost", "units"),
  };
}

function generateProductionInsights(d: ExtractedData, report: ReportData | null): string[] {
  const notes: string[] = [];
  if (d.target > 0 && report?.plantCapacity) {
    const pct = (d.target / report.plantCapacity) * 100;
    const warning = pct > 100 ? " ⚠️ SOBRE CAPACIDAD" : "";
    notes.push(
      `Meta de ${fmt(d.target)} unidades = ${fmt(pct, 1)}% de capacidad de planta (${fmt(report.plantCapacity)} uds).${warning}`,
    );
  }
  if (d.totalMP > 0 && report?.mpInitialQty) {
    const deficit = d.totalMP - report.mpInitialQty;
    if (deficit > 0) {
      notes.push(
        `⚠️ Se necesitan ${fmt(d.totalMP)} uds de MP pero solo hay ${fmt(report.mpInitialQty)} en inventario. Faltan ${fmt(deficit)} uds (riesgo de compra de emergencia).`,
      );
    } else {
      notes.push(
        `MP cubierta: ${fmt(d.totalMP)} necesarias vs. ${fmt(report.mpInitialQty)} disponibles (+${fmt(-deficit)} excedente).`,
      );
    }
  }
  if (d.packUnits > 0 && d.target > 0) {
    notes.push(`Empaques: ${fmt(d.packUnits)} uds requeridas (ratio ${fmt(d.packRatio, 2)} por unidad producida).`);
  }
  if (notes.length === 0) notes.push("Agrega nodos de producción para generar notas estratégicas.");
  return notes;
}

function generateHRInsights(d: ExtractedData, report: ReportData | null): string[] {
  const notes: string[] = [];
  if (d.hires > 0) {
    const effectiveHrs = d.currentWorkers * d.hrsPerWorker + d.hires * d.hrsPerWorker * 0.5;
    notes.push(
      `Contratando ${fmt(d.hires)} nuevos trabajadores al 50% de eficiencia. Capacidad laboral efectiva ≈ ${fmt(effectiveHrs)} horas (regla 2x aplicada).`,
    );
  }
  if (d.currentWorkers > 0 && report?.workersClosing) {
    const diff = d.currentWorkers + d.hires - report.workersClosing;
    if (diff !== 0) {
      const direction = diff > 0 ? "más" : "menos";
      notes.push(
        `Cambio neto de fuerza laboral: ${Math.abs(diff)} trabajadores ${direction} que el periodo anterior (${fmt(report.workersClosing)} → ${fmt(d.currentWorkers + d.hires)}).`,
      );
    }
  }
  if (notes.length === 0) notes.push("Agrega nodos de recursos humanos para generar notas estratégicas.");
  return notes;
}

function generateFinancialInsights(d: ExtractedData, report: ReportData | null): string[] {
  const notes: string[] = [];
  if (d.totalCost > 0) {
    const matPct = (d.matCost / d.totalCost) * 100;
    const labPct = (d.labCost / d.totalCost) * 100;
    const packPct = ((d.packCost + d.discCost) / d.totalCost) * 100;
    const fixPct = (d.fixCost / d.totalCost) * 100;
    notes.push(
      `Estructura de costos: Material ${fmt(matPct, 1)}%, Mano de obra ${fmt(labPct, 1)}%, Empaque/Otros ${fmt(packPct, 1)}%, Fijos ${fmt(fixPct, 1)}%.`,
    );
  }
  if (d.unitCost > 0 && report?.unitCostIndustrial) {
    const diff = d.unitCost - report.unitCostIndustrial;
    const sign = diff > 0 ? "+" : "";
    notes.push(
      `Costo unitario planeado: ${fmtMoney(d.unitCost)} vs. referencia trimestre anterior: ${fmtMoney(report.unitCostIndustrial)} (${sign}${fmtMoney(diff)}).`,
    );
  }
  if (notes.length === 0) notes.push("Agrega nodos financieros para generar notas estratégicas.");
  return notes;
}

function notesBlock(title: string, color: string, notes: string[]): string {
  return `<div class="notes-block" style="border-left:3px solid ${color};background:${color}10;padding:6px 10px;margin:8px 0 16px 0;border-radius:0 6px 6px 0;">
    <div style="font-size:10px;font-weight:700;color:${color};margin-bottom:4px;">📝 ${title}</div>
    <ul style="list-style:none;padding:0;margin:0;">
      ${notes.map((n) => `<li style="font-size:9px;color:#334155;padding:2px 0;padding-left:12px;position:relative;line-height:1.4;"><span style="position:absolute;left:0;color:${color};font-weight:bold;">▸</span>${n}</li>`).join("")}
    </ul>
  </div>`;
}

function formCell(label: string, value: string, isEmpty = false): string {
  const valStyle = isEmpty
    ? "background:#fff;border:1px dashed #cbd5e1;color:#94a3b8;font-style:italic;"
    : "background:#fff;border:1px solid #e2e8f0;color:#1e293b;font-weight:600;";
  return `<div style="display:flex;flex-direction:column;gap:2px;">
    <span style="font-size:8px;color:#64748b;text-transform:uppercase;letter-spacing:0.3px;">${label}</span>
    <div style="padding:4px 8px;border-radius:4px;font-size:11px;min-height:22px;${valStyle}">${value}</div>
  </div>`;
}

function sectionHeader(number: string, title: string, color: string): string {
  return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
    <div style="background:${color};color:#fff;font-size:11px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${number}</div>
    <h2 style="font-size:13px;font-weight:700;color:#1e293b;margin:0;">${title}</h2>
  </div>`;
}

export function exportStrategyPDF(nodes: NodeData[], reportData: ReportData | null): void {
  const d = extractData(nodes);
  const prodNotes = generateProductionInsights(d, reportData);
  const hrNotes = generateHRInsights(d, reportData);
  const finNotes = generateFinancialInsights(d, reportData);
  const date = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const quarter = reportData?.quarterLabel || "";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>GoProd — Hoja de Decisiones</title>
<style>
  @page { size: A4; margin: 1cm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1e293b; background:#fff; padding:20px; font-size:11px; }
  .header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #3b82f6; padding-bottom:6px; margin-bottom:14px; }
  .header h1 { font-size:18px; font-weight:700; color:#1e293b; letter-spacing:-0.5px; }
  .header h1 span { color:#3b82f6; }
  .header .meta { text-align:right; font-size:10px; color:#64748b; }
  .form-row { display:grid; grid-template-columns:140px 1fr 1fr; gap:1px; margin-bottom:1px; }
  .row-label { background:#f1f5f9; padding:6px 10px; font-size:10px; font-weight:700; color:#475569; display:flex; align-items:center; border-left:3px solid; border-radius:2px 0 0 2px; }
  .row-fields { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:6px 10px; background:#f8fafc; }
  .row-fields.single { grid-template-columns:1fr; }
  .section-block { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:4px; overflow:hidden; }
  .fin-row { display:flex; justify-content:space-between; padding:3px 0; font-size:10px; }
  .fin-row .label { color:#64748b; }
  .fin-row .value { font-weight:600; }
  .fin-row.total { border-top:1px solid #cbd5e1; padding-top:5px; margin-top:3px; font-weight:700; font-size:11px; }
  .footer { text-align:center; margin-top:12px; font-size:8px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:6px; }
</style></head><body>

<div class="header">
  <h1><span>Go</span>Prod — Hoja de Decisiones</h1>
  <div class="meta">${date}${quarter ? `<br><strong>${quarter}</strong>` : ""}</div>
</div>

<!-- PRODUCCIÓN -->
${sectionHeader("3", "Producción", "#059669")}
<div class="section-block">
  <div class="form-row">
    <div class="row-label" style="border-color:#059669;">Producción</div>
    <div class="row-fields">
      ${formCell("Unidades", d.target ? fmt(d.target) : "—")}
      ${formCell("Empaques", d.packUnits ? fmt(d.packUnits) : "—")}
    </div>
  </div>
  <div class="form-row">
    <div class="row-label" style="border-color:#059669;">Investigación y Desarrollo</div>
    <div class="row-fields single">
      ${formCell("I + D", "(decisión manual)", true)}
    </div>
  </div>
  <div class="form-row">
    <div class="row-label" style="border-color:#059669;">Materia Prima</div>
    <div class="row-fields">
      ${formCell("Unidades asignadas", d.totalMP ? fmt(d.totalMP) : "—")}
      ${formCell("Compras para (t+1) en $", "(decisión manual)", true)}
    </div>
  </div>
</div>
${notesBlock("Notas Estratégicas — Producción", "#059669", prodNotes)}

<!-- RECURSOS HUMANOS -->
${sectionHeader("4", "Recursos Humanos", "#7c3aed")}
<div class="section-block">
  <div class="form-row">
    <div class="row-label" style="border-color:#7c3aed;">Mano de Obra</div>
    <div class="row-fields">
      ${formCell("A contratar", d.hires ? fmt(d.hires) : "0")}
      ${formCell("A despedir", "0")}
    </div>
  </div>
  <div class="form-row">
    <div class="row-label" style="border-color:#7c3aed;"></div>
    <div class="row-fields">
      ${formCell("Salario por hora", d.wage ? fmtMoney(d.wage) : "—")}
      ${formCell("Gastos discrecionales", d.discCost ? fmtMoney(d.discCost) : "—")}
    </div>
  </div>
  <div class="form-row">
    <div class="row-label" style="border-color:#7c3aed;">Fuerza de Venta</div>
    <div class="row-fields">
      ${formCell("A contratar", "(decisión manual)", true)}
      ${formCell("A despedir", "(decisión manual)", true)}
    </div>
  </div>
  <div class="form-row">
    <div class="row-label" style="border-color:#7c3aed;"></div>
    <div class="row-fields single">
      ${formCell("Salario por hora", "(decisión manual)", true)}
    </div>
  </div>
</div>
${notesBlock("Notas Estratégicas — Recursos Humanos", "#7c3aed", hrNotes)}

<!-- FINANCIERO -->
<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
  <h2 style="font-size:13px;font-weight:700;color:#1e293b;margin:0;">Aspectos Financieros a Considerar en su flujo de caja</h2>
</div>
<div class="section-block">
  <div class="fin-row"><span class="label">Costo de Material</span><span class="value">${fmtMoney(d.matCost)}${d.matPrice ? ` <span style="font-size:9px;color:#94a3b8">@ ${fmtMoney(d.matPrice)}/ud</span>` : ""}</span></div>
  <div class="fin-row"><span class="label">Costo de Mano de Obra</span><span class="value">${fmtMoney(d.labCost)}${d.wage ? ` <span style="font-size:9px;color:#94a3b8">@ ${fmtMoney(d.wage)}/hr</span>` : ""}</span></div>
  <div class="fin-row"><span class="label">Costo de Empaques</span><span class="value">${fmtMoney(d.packCost)}</span></div>
  <div class="fin-row"><span class="label">Costos Fijos</span><span class="value">${fmtMoney(d.fixCost)}</span></div>
  <div class="fin-row"><span class="label">Gastos Discrecionales</span><span class="value">${fmtMoney(d.discCost)}</span></div>
  <div class="fin-row total"><span class="label">Costo Total</span><span class="value">${fmtMoney(d.totalCost)}</span></div>
  <div class="fin-row"><span class="label">Costo Unitario</span><span class="value">${fmtMoney(d.unitCost)}${d.unitsProduced ? ` <span style="font-size:9px;color:#94a3b8">sobre ${fmt(d.unitsProduced)} uds</span>` : ""}</span></div>
</div>
${notesBlock("Notas Estratégicas — Financiero", "#0d9488", finNotes)}

<div class="footer">GoProd © 2026 · Desarrollado por Uniandes · Generado para propósitos de planeación estratégica</div>

</body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Por favor permite las ventanas emergentes para exportar el PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.onload = () => {
    setTimeout(() => w.print(), 300);
  };
}
