"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Percent, Wallet, ShoppingCart, Settings } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  PRICES, ACCESSORY_TOTAL, TARP_OPTIONS, QUILT_OPTIONS,
} from "@/lib/pricing";

const currency = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

type Tarp = (typeof TARP_OPTIONS)[number];
type Quilt = (typeof QUILT_OPTIONS)[number];

type KitRow = {
  name: string;
  tarp: Tarp;
  quilt?: Quilt;
  volume: number;
};

function KPI({
  label, value, icon: Icon,
}: { label: string; value: string; icon?: any }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
        {Icon && <Icon className="size-3.5" />} {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <th className={`px-3 py-2 text-left text-xs font-semibold ${className}`}>{children}</th>
  );
}

function Td({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>;
}

function MarginPill({ value }: { value: number }) {
  const color =
    value >= 0.5
      ? "bg-emerald-100 text-emerald-700"
      : value >= 0.35
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex items-center justify-end min-w-16 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {pct(value)}
    </span>
  );
}

function Spark({ a, b }: { a: number; b: number }) {
  const max = Math.max(a, b, 0.001);
  const aw = Math.round((a / max) * 100);
  const bw = Math.round((b / max) * 100);
  return (
    <div className="inline-flex gap-1 items-end h-6 w-24 justify-end">
      <div className="bg-neutral-300 h-4" style={{ width: `${aw}%` }} />
      <div className="bg-neutral-500 h-6" style={{ width: `${bw}%` }} />
    </div>
  );
}

export default function Page() {
  const [globalDiscountPct, setGlobalDiscountPct] = useState<number>(0.15);
  const [scenario, setScenario] = useState<string>("15% Off");

  const [rows, setRows] = useState<KitRow[]>([
    { name: "Wanderlust Basic", tarp: "Quest", volume: 1 },
    { name: "Wanderlust Insul. Slim", tarp: "Quest", quilt: "Burrow Slim", volume: 1 },
    { name: "Wanderlust Insul. Standard", tarp: "Quest", quilt: "Burrow Standard", volume: 1 },
  ]);

  const setRow = (idx: number, patch: Partial<KitRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const calc = useMemo(() => {
    const perRow = rows.map((r) => {
      const hammock = PRICES.hammock;
      const tarp = PRICES.tarp[r.tarp];
      const accessories = ACCESSORY_TOTAL;

      const retailParts = [hammock.retail, tarp.retail, accessories.retail];
      const cogsParts = [hammock.cogs, tarp.cogs, accessories.cogs];

      if (r.quilt) {
        const uq = PRICES.underQuilt;
        const tq = PRICES.topQuilt[r.quilt];
        retailParts.push(uq.retail, tq.retail);
        cogsParts.push(uq.cogs, tq.cogs);
      }

      const retail = retailParts.reduce((a, b) => a + b, 0);
      const cogs = cogsParts.reduce((a, b) => a + b, 0);

      const discounted = retail * (1 - globalDiscountPct);

      const profitOrig = retail - cogs;
      const profitDisc = discounted - cogs;

      const marginOrig = retail > 0 ? profitOrig / retail : 0;
      const marginDisc = discounted > 0 ? profitDisc / discounted : 0;

      return {
        ...r,
        retail,
        cogs,
        discounted,
        profitOrig,
        profitDisc,
        marginOrig,
        marginDisc,
      };
    });

    const sum = (fn: (x: any) => number) => perRow.reduce((a, r) => a + fn(r), 0);

    const totalRetail = sum((r) => r.retail * r.volume);
    const totalDisc = sum((r) => r.discounted * r.volume);
    const totalCogs = sum((r) => r.cogs * r.volume);

    const totalProfitOrig = sum((r) => (r.retail - r.cogs) * r.volume);
    const totalProfitDisc = sum((r) => (r.discounted - r.cogs) * r.volume);

    const weightedMarginOrig = totalRetail > 0 ? totalProfitOrig / totalRetail : 0;
    const weightedMarginDisc = totalDisc > 0 ? totalProfitDisc / totalDisc : 0;

    return {
      perRow,
      totalRetail,
      totalDisc,
      totalCogs,
      weightedMarginOrig,
      weightedMarginDisc,
      totalProfitOrig,
      totalProfitDisc,
    };
  }, [rows, globalDiscountPct]);

  const chartData = useMemo(
    () =>
      calc.perRow.map((r) => ({
        name: r.name.replace("Wanderlust ", ""),
        Original: +(r.marginOrig * 100).toFixed(1),
        Discounted: +(r.marginDisc * 100).toFixed(1),
      })),
    [calc]
  );

  const applyScenario = (label: string) => {
    setScenario(label);
    const map: Record<string, number> = {
      "No Discount": 0,
      "10% Off": 0.1,
      "15% Off": 0.15,
      "20% Off": 0.2,
      Custom: globalDiscountPct,
    };
    setGlobalDiscountPct(map[label] ?? 0.15);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 p-6">
      <div className="mx-auto max-w-7xl grid grid-cols-12 gap-4">
        {/* Header */}
        <div className="col-span-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl bg-neutral-900" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Wanderlust Kit Pricing</h1>
              <p className="text-sm text-neutral-500 -mt-0.5">
                Visual mock • interactive • accessories always included
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full">
            Mock • Next.js + Tailwind + Recharts
          </Badge>
        </div>

        {/* Controls */}
        <Card className="col-span-12 lg:col-span-8 shadow-sm rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <h2 className="font-medium">Global Controls</h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["No Discount", "10% Off", "15% Off", "20% Off", "Custom"].map((label) => (
                  <Button
                    key={label}
                    size="sm"
                    variant={scenario === label ? "default" : "secondary"}
                    className="rounded-full"
                    onClick={() => applyScenario(label)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-9">
                <label className="text-sm text-neutral-600 flex items-center gap-2">
                  <Percent className="size-4" /> Global Discount
                </label>
                <div className="mt-2">
                  <Slider
                    value={[Math.round(globalDiscountPct * 100)]}
                    min={0}
                    max={60}
                    step={1}
                    onValueChange={(v) => setGlobalDiscountPct(v[0] / 100)}
                  />
                </div>
              </div>
              <div className="col-span-12 md:col-span-3">
                <div className="text-center md:text-right">
                  <div className="text-3xl font-semibold leading-none">
                    {Math.round(globalDiscountPct * 100)}%
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">applied to all kits</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="col-span-12 lg:col-span-4 shadow-sm rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4" />
              <h2 className="font-medium">Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KPI label="Total Retail (Vol)" value={`$${currency(calc.totalRetail)}`} icon={ShoppingCart} />
              <KPI label="Total Discounted (Vol)" value={`$${currency(calc.totalDisc)}`} icon={Percent} />
              <KPI label="Total COGS (Vol)" value={`$${currency(calc.totalCogs)}`} icon={Wallet} />
              <KPI label="Weighted Margin (Orig)" value={pct(calc.weightedMarginOrig)} />
              <KPI label="Weighted Margin (Disc)" value={pct(calc.weightedMarginDisc)} />
              <KPI label="Total Profit (Disc)" value={`$${currency(calc.totalProfitDisc)}`} />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="col-span-12 shadow-sm rounded-2xl">
          <CardContent className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 text-neutral-600">
                <tr>
                  <Th>Kit</Th>
                  <Th className="w-[160px]">Tarp</Th>
                  <Th className="w-[200px]">Top Quilt</Th>
                  <Th className="text-right">Retail</Th>
                  <Th className="text-right">COGS</Th>
                  <Th className="text-right">Disc Price</Th>
                  <Th className="text-right">Margin (Orig)</Th>
                  <Th className="text-right">Margin (Disc)</Th>
                  <Th className="text-right">Spark</Th>
                  <Th className="w-[110px] text-right">Volume</Th>
                </tr>
              </thead>
              <tbody>
                {calc.perRow.map((r, i) => (
                  <tr key={r.name} className="border-b last:border-none">
                    <Td className="font-medium">{r.name}</Td>
                    <Td>
                      <Select value={r.tarp} onValueChange={(v) => setRow(i, { tarp: v as Tarp })}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TARP_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Td>
                    <Td>
                      {r.quilt ? (
                        <Select value={r.quilt} onValueChange={(v) => setRow(i, { quilt: v as Quilt })}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUILT_OPTIONS.map((q) => (
                              <SelectItem key={q} value={q}>
                                {q}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </Td>
                    <Td className="text-right">${currency(r.retail)}</Td>
                    <Td className="text-right">${currency(r.cogs)}</Td>
                    <Td className="text-right">${currency(r.discounted)}</Td>
                    <Td className="text-right">
                      <MarginPill value={r.marginOrig} />
                    </Td>
                    <Td className="text-right">
                      <MarginPill value={r.marginDisc} />
                    </Td>
                    <Td className="text-right">
                      <Spark a={r.marginOrig} b={r.marginDisc} />
                    </Td>
                    <Td className="text-right">
                      <Input
                        value={rows[i].volume}
                        onChange={(e) => setRow(i, { volume: Math.max(0, Number(e.target.value || 0)) })}
                        type="number"
                        min={0}
                        className="h-8 text-right"
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="col-span-12 shadow-sm rounded-2xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4" />
              <h2 className="font-medium">Margin by Kit (Orig vs Discounted)</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ left: 10, right: 20 }}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis unit="%" fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="Original" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Discounted" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
