"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";

interface ChartProps {
  data: Array<{ time: string; value: number }>;
  height?: number;
  width?: number;
  color?: string;
}

export function PnLChart({ data, height = 256, width = 600, color = "#22c55e" }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: width,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#888',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    // Create line series
    const lineSeries = chart.addLineSeries({
      color: color,
      lineWidth: 2,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;

    // Set initial data
    if (data.length > 0) {
      lineSeries.setData(data);
    }

    // Fit content
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [width, height, color]);

  useEffect(() => {
    if (lineSeriesRef.current && data.length > 0) {
      lineSeriesRef.current.setData(data);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data]);

  return <div ref={chartContainerRef} style={{ width, height }} />;
}

// Whale Activity Chart
export function WhaleActivityChart({ data }: { data: Array<{ time: string; value: number }> }) {
  return (
    <PnLChart 
      data={data} 
      color="#3b82f6" 
      height={128}
      width={300}
    />
  );
}