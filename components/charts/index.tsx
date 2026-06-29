"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/types";
import { compactNumber } from "@/lib/utils";

const axisProps = {
  stroke: "currentColor",
  tick: { fontSize: 11, fill: "currentColor" },
  tickLine: false,
  axisLine: false,
} as const;

function ChartTip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-semibold text-popover-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.stroke || p.fill }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-mono font-semibold text-popover-foreground">
            {typeof p.value === "number" ? compactNumber(p.value) : p.value}
            {unit ? ` ${unit}` : ""}
          </span>
        </p>
      ))}
    </div>
  );
}

export function AreaTrend({
  data,
  dataKey = "value",
  color = "var(--chart-1)",
  height = 240,
  unit,
  showAxis = true,
}: {
  data: TrendPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  unit?: string;
  showAxis?: boolean;
}) {
  const id = `area-${dataKey}-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        {showAxis && <XAxis dataKey="label" {...axisProps} />}
        {showAxis && <YAxis {...axisProps} width={42} tickFormatter={(v) => compactNumber(v)} />}
        <Tooltip content={<ChartTip unit={unit} />} cursor={{ stroke: color, strokeOpacity: 0.3 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.4} fill={`url(#${id})`} animationDuration={1400} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLineTrend({
  data,
  lines,
  height = 260,
}: {
  data: TrendPoint[];
  lines: { key: string; color: string; label: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={42} tickFormatter={(v) => compactNumber(v)} />
        <Tooltip content={<ChartTip />} />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={1400}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarMini({
  data,
  dataKey = "value",
  color = "var(--chart-2)",
  height = 240,
  unit,
}: {
  data: TrendPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 6, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={42} tickFormatter={(v) => compactNumber(v)} />
        <Tooltip content={<ChartTip unit={unit} />} cursor={{ fill: "currentColor", fillOpacity: 0.05 }} />
        <Bar dataKey={dataKey} fill={color} radius={[5, 5, 0, 0]} animationDuration={1200} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RadialGauge({
  value,
  size = 150,
  color = "var(--chart-1)",
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}) {
  const data = [{ name: "score", value, fill: color }];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={data} startAngle={90} endAngle={90 - (value / 100) * 360}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: "currentColor", opacity: 0.08 } as any} dataKey="value" cornerRadius={20} angleAxisId={0} animationDuration={1400} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold" style={{ color }}>
          {label ?? `${Math.round(value)}%`}
        </span>
        {sublabel && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}

export function DonutBreakdown({
  data,
  colors,
  height = 220,
}: {
  data: TrendPoint[];
  colors: string[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={3} animationDuration={1200}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<ChartTip unit="%" />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
