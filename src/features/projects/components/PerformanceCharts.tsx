"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ProjectPerformanceData } from "@/features/projects/types";
import { Gauge, TrendingUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface PerformanceChartsProps {
  performanceData?: ProjectPerformanceData;
}

export function PerformanceCharts({ performanceData }: PerformanceChartsProps) {
  const lighthouse = performanceData?.lighthouse;
  const conversions = performanceData?.conversions;
  const summary = performanceData?.summary;

  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const conversionSvgRef = useRef<SVGSVGElement>(null);
  const lighthouseSvgRef = useRef<SVGSVGElement>(null);

  // 1. Render Interactive D3 Lighthouse Gauges
  useEffect(() => {
    if (!lighthouse || !lighthouseSvgRef.current) return;

    const svg = d3.select(lighthouseSvgRef.current);
    svg.selectAll("*").remove();

    const metrics = [
      { name: "Performance", score: lighthouse.performance, metric: "LCP/TBT" },
      { name: "Accessibility", score: lighthouse.accessibility, metric: "WCAG 2.2" },
      { name: "Best Practices", score: lighthouse.bestPractices, metric: "Security/TLS" },
      { name: "SEO", score: lighthouse.seo, metric: "JSON-LD" },
    ];

    const width = 640;
    const height = 140;
    const margin = { left: 20, right: 20, top: 10, bottom: 30 };
    const chartWidth = width - margin.left - margin.right;
    const slotWidth = chartWidth / metrics.length;
    const radius = 42;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "auto")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    metrics.forEach((m, idx) => {
      const centerX = idx * slotWidth + slotWidth / 2;
      const centerY = 56;

      const group = g
        .append("g")
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .style("cursor", "pointer")
        .on("mouseenter", () => setActiveMetric(m.name))
        .on("mouseleave", () => setActiveMetric(null));

      // Background Track Ring
      const arcBg = d3
        .arc<unknown>()
        .innerRadius(radius - 7)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(Math.PI * 2);

      group
        .append("path")
        .attr("d", arcBg({}))
        .attr("fill", "var(--line)")
        .attr("opacity", 0.6);

      // Value Ring
      const scoreAngle = (Math.min(100, Math.max(0, m.score)) / 100) * (Math.PI * 2);
      const arcScore = d3
        .arc<unknown>()
        .innerRadius(radius - 7)
        .outerRadius(radius)
        .startAngle(0)
        .endAngle(scoreAngle)
        .cornerRadius(4);

      // Score color based on Lighthouse standard: >=90 green, >=50 orange, <50 red
      const scoreColor =
        m.score >= 90
          ? "var(--success, #10b981)"
          : m.score >= 50
          ? "var(--warning, #f59e0b)"
          : "var(--danger, #ef4444)";

      group
        .append("path")
        .attr("d", arcScore({}))
        .attr("fill", scoreColor)
        .style("transition", "all 0.3s ease");

      // Score Text
      group
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-family", "monospace")
        .attr("font-size", "18px")
        .attr("font-weight", "700")
        .attr("fill", "var(--ink)")
        .text(Math.round(m.score));

      // Metric Label
      group
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", radius + 18)
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("fill", "var(--ink-muted)")
        .text(m.name);
    });
  }, [lighthouse]);

  // 2. Render Interactive D3 Conversion Funnel Chart
  useEffect(() => {
    if (!conversions || conversions.length === 0 || !conversionSvgRef.current) return;

    const svg = d3.select(conversionSvgRef.current);
    svg.selectAll("*").remove();

    const width = 640;
    const height = 220;
    const margin = { top: 20, right: 30, bottom: 40, left: 130 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "auto")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(conversions.map((d) => d.step))
      .range([0, innerHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    // Grid lines
    g.append("g")
      .attr("stroke", "var(--line)")
      .attr("stroke-opacity", 0.4)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(innerHeight)
          .tickFormat(() => ""),
      );

    // Bars
    const barGroups = g
      .selectAll(".bar-group")
      .data(conversions)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => setActiveMetric(`${d.step}: ${d.rate}%`))
      .on("mouseleave", () => setActiveMetric(null));

    // Background track bar
    barGroups
      .append("rect")
      .attr("y", (d) => yScale(d.step) || 0)
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", innerWidth)
      .attr("rx", 4)
      .attr("fill", "var(--surface-2)");

    // Active conversion rate bar
    barGroups
      .append("rect")
      .attr("y", (d) => yScale(d.step) || 0)
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d.rate))
      .attr("rx", 4)
      .attr("fill", "var(--accent)")
      .attr("opacity", 0.9);

    // Value Labels
    barGroups
      .append("text")
      .attr("y", (d) => (yScale(d.step) || 0) + yScale.bandwidth() / 2)
      .attr("x", (d) => xScale(d.rate) + 8)
      .attr("dy", "0.35em")
      .attr("font-family", "monospace")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", "var(--ink)")
      .text((d) => `${d.rate}%`);

    // Y Axis Labels
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", "var(--ink-muted)")
      .attr("dx", "-8px");

    // Remove axis domain lines for crisp minimal look
    g.selectAll(".domain").remove();
  }, [conversions]);

  if (!lighthouse && (!conversions || conversions.length === 0)) {
    return null;
  }

  return (
    <section className="space-y-6 pt-4 border-t border-[var(--line)]" aria-labelledby="perf-metrics-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="success">Performance &amp; ROI</Badge>
            {activeMetric && (
              <span className="text-xs font-mono font-bold text-[var(--accent)] animate-in fade-in duration-100">
                {activeMetric}
              </span>
            )}
          </div>
          <h2 id="perf-metrics-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
            Verified Production Metrics &amp; Lighthouse Telemetry
          </h2>
          <p className="text-xs text-[var(--ink-muted)] max-w-xl">
            Live audits and verified funnel conversion data demonstrating zero-pill discipline and real-world rendering velocity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lighthouse Audit Scores (D3) */}
        {lighthouse && (
          <div className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                  Google Lighthouse Audits
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--ink-muted)]">Target: 95+</span>
            </div>

            <div className="w-full overflow-x-auto py-2">
              <svg ref={lighthouseSvgRef} className="mx-auto max-w-[560px]" aria-label="Lighthouse audit score gauges" />
            </div>

            {/* Core Web Vitals Row */}
            {(lighthouse.fcp || lighthouse.lcp || lighthouse.cls || lighthouse.tbt) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[var(--line)] text-center">
                {lighthouse.fcp && (
                  <div className="p-2 rounded-[var(--r-sm)] bg-[var(--surface-2)]">
                    <p className="text-[10px] uppercase font-mono text-[var(--ink-muted)]">FCP</p>
                    <p className="text-xs font-mono font-bold text-[var(--ink)] mt-0.5">{lighthouse.fcp}</p>
                  </div>
                )}
                {lighthouse.lcp && (
                  <div className="p-2 rounded-[var(--r-sm)] bg-[var(--surface-2)]">
                    <p className="text-[10px] uppercase font-mono text-[var(--ink-muted)]">LCP</p>
                    <p className="text-xs font-mono font-bold text-[var(--ink)] mt-0.5">{lighthouse.lcp}</p>
                  </div>
                )}
                {lighthouse.cls && (
                  <div className="p-2 rounded-[var(--r-sm)] bg-[var(--surface-2)]">
                    <p className="text-[10px] uppercase font-mono text-[var(--ink-muted)]">CLS</p>
                    <p className="text-xs font-mono font-bold text-[var(--ink)] mt-0.5">{lighthouse.cls}</p>
                  </div>
                )}
                {lighthouse.tbt && (
                  <div className="p-2 rounded-[var(--r-sm)] bg-[var(--surface-2)]">
                    <p className="text-[10px] uppercase font-mono text-[var(--ink-muted)]">TBT</p>
                    <p className="text-xs font-mono font-bold text-[var(--ink)] mt-0.5">{lighthouse.tbt}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Funnel Conversion Chart (D3) */}
        {conversions && conversions.length > 0 && (
          <div className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                  Funnel &amp; Retention Progression
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[var(--ink-muted)]">Interactive D3.js</span>
            </div>

            <div className="w-full overflow-x-auto py-2">
              <svg ref={conversionSvgRef} className="mx-auto max-w-[560px]" aria-label="Funnel conversion bar chart" />
            </div>

            <p className="text-[11px] text-[var(--ink-muted)] text-center">
              Hover over funnel stages to inspect exact conversion percentages.
            </p>
          </div>
        )}
      </div>

      {summary && (
        <div className="p-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] flex items-start gap-3">
          <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-[var(--ink)] leading-relaxed">
            <strong className="font-semibold">Performance Impact: </strong>
            {summary}
          </p>
        </div>
      )}
    </section>
  );
}
