import type { Industry, FlowNode, NodeStatus } from "@/lib/types";

/** Detailed ETP pipeline using the unit's RO-stage capacities (KLD). */
export function buildEtpStageFlow(ind: Industry): FlowNode[] {
  const raw = ind.maxEffluentGeneration ?? Math.round(ind.permittedKLD * 0.96);
  const etp = ind.etpCapacity;
  const r1 = ind.roStage1 ?? ind.roCapacity;
  const r2 = ind.roStage2 ?? Math.round(ind.roCapacity * 0.68);
  const r3 = ind.roStage3 ?? Math.round(ind.roCapacity * 0.42);
  const r4 = ind.roStage4 ?? Math.round(ind.roCapacity * 0.24);
  const mee = ind.meeCapacity;
  return [
    { id: `${ind.id}-raw`, label: "Max. Effluent Generation", short: "Raw", type: "raw", value: raw, unit: "KLD", status: "normal" },
    { id: `${ind.id}-etp`, label: "ETP Capacity", short: "ETP", type: "treatment", value: etp, unit: "KLD", status: "normal" },
    { id: `${ind.id}-ro1`, label: "RO Stage I", short: "RO I", type: "treatment", value: r1, unit: "KLD", status: "normal" },
    { id: `${ind.id}-ro2`, label: "RO Stage II", short: "RO II", type: "treatment", value: r2, unit: "KLD", status: "normal" },
    { id: `${ind.id}-ro3`, label: "RO Stage III", short: "RO III", type: "treatment", value: r3, unit: "KLD", status: "normal" },
    { id: `${ind.id}-ro4`, label: "RO Stage IV", short: "RO IV", type: "treatment", value: r4, unit: "KLD", status: "normal" },
    { id: `${ind.id}-mee`, label: "MEE Capacity", short: "MEE", type: "treatment", value: mee, unit: "KLD", status: "normal" },
  ];
}

/** Builds a 5-stage ETP treatment pipeline for an individual unit. */
export function buildEtpFlow(ind: Industry): FlowNode[] {
  const s = (v: number): NodeStatus => (v < ind.permittedKLD * 0.2 ? "warning" : "normal");
  const raw = Math.round(ind.permittedKLD * 0.96);
  const etp = Math.round(ind.etpCapacity * 0.9);
  const ro = Math.round(ind.roCapacity * 0.86);
  const mee = Math.round(ind.meeCapacity * 0.78);
  const rec = Math.round(ro * 0.92);
  return [
    { id: `${ind.id}-raw`, label: "Raw Effluent", short: "Raw", type: "raw", value: raw, unit: "KLD", status: "normal" },
    { id: `${ind.id}-etp`, label: "ETP Treatment", short: "ETP", type: "treatment", value: etp, unit: "KLD", status: s(etp) },
    { id: `${ind.id}-ro`, label: "Reverse Osmosis", short: "RO", type: "treatment", value: ro, unit: "KLD", status: s(ro) },
    { id: `${ind.id}-mee`, label: "MEE", short: "MEE", type: "treatment", value: mee, unit: "KLD", status: "normal" },
    { id: `${ind.id}-rec`, label: "Water Recovery", short: "Recovery", type: "recovery", value: rec, unit: "KLD", status: "normal" },
  ];
}
