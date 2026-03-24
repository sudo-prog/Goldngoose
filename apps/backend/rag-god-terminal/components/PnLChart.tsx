"use client";

import { useEffect, useRef, useState } from "react";

interface PnLChartProps {
  data: Array<{ time: string; value: number }>;
  height?: number;
  width?: number;
}

export function PnLChart({ data, height = 256, width = 600 }: PnLChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if lightweight-charts is available
    if (typeof window !== 'undefined') {
      import('lightweight-charts').then((lightweightCharts) => {
        setIsLoaded(true);
        if (chartContainerRef.current && !chartRef.current) {
          const chart = lightweightCharts.createChart(chartContainerRef.current, {
            width: width,
            height: height,
            layout: {
              background: { type: lightweightCharts.ColorType.Solid, color: 'transparent' },
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

          const lineSeries = chart.addLineSeries({
            color: '#22c55e',
            lineWidth: 2,
            priceLineVisible: false,
          });

          chartRef.current = { chart, lineSeries };

          if (data.length > 0) {
            lineSeries.setData(data);
          }
          chart.timeScale().fitContent();
        }
      }).catch((error) => {
        console.error('Failed to load lightweight-charts:', error);
      });
    }
  }, [width, height]);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      chartRef.current.lineSeries.setData(data);
      chartRef.current.chart.timeScale().fitContent();
    }
  }, [data]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.chart.remove();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      {!isLoaded && (
        <div className="flex items-center justify-center h-64 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      )}
      <div ref={chartContainerRef} style={{ width, height }} />
    </div>
  );
}