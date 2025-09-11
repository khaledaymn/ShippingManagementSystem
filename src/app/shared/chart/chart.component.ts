import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface ChartData {
  type: "line" | "doughnut" | "bar";
  data: {
    labels?: string[];
    values?: number[];
    colors?: string[];
    datasets?: Array<{
      label?: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string | string[];
      tension?: number;
      borderWidth?: number;
    }>;
  };
  options?: {
    responsive?: boolean;
    plugins?: {
      legend?: { display?: boolean; position?: string };
      tooltip?: { enabled?: boolean };
    };
    scales?: {
      y?: { beginAtZero?: boolean; max?: number };
    };
  };
  title: string;
}

@Component({
  selector: "app-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"],
})
export class ChartComponent implements OnInit, OnDestroy {
  @Input() chartData!: ChartData;
  @Input() showStats = false;

  @ViewChild("chartContainer", { static: true }) chartContainer!: ElementRef;

  lineChartPathArea = "";
  lineChartPathLine = "";
  animatedDataPoints: Array<{
    x: number;
    y: number;
    value: number;
    month: number;
    delay: number;
  }> = [];

  radialSegments: Array<{
    value: number;
    label: string;
    color: string;
    percentage: number;
    strokeDasharray: string;
    strokeDashoffset: number;
  }> = [];

  hoveredDataPoint: number | null = null;
  chartAnimationComplete = false;

  private resizeObserver!: ResizeObserver;

  ngOnInit(): void {
    this.updateChartDimensions();
    this.setupResizeObserver();

    setTimeout(() => {
      this.chartAnimationComplete = true;
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateChartDimensions();
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  private updateChartDimensions(): void {
    const container = this.chartContainer.nativeElement;
    const width = container.offsetWidth || 280; // Fallback to original width
    const height = container.offsetHeight || 600; // Fallback to original height

    if (this.chartData.type === "line") {
      this.lineChartPathArea = this.getEnhancedLineChartPath(this.chartData, true, width, height);
      this.lineChartPathLine = this.getEnhancedLineChartPath(this.chartData, false, width, height);
      this.animatedDataPoints = this.getAnimatedDataPoints(this.chartData, width, height);
    } else if (this.chartData.type === "doughnut") {
      this.radialSegments = this.getRadialSegments(this.chartData);
    }
  }

  private getEnhancedLineChartPath(chart: ChartData, isArea: boolean, width: number, height: number): string {
    if (!chart || chart.type !== "line" || !chart.data?.datasets?.[0]?.data) {
      return "";
    }

    const data = chart.data.datasets[0].data as number[];
    const padding = width * 0.1; // 10% of width for padding
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    const dataPoints = data.length;

    const points = data.map((value, index) => {
      const x = padding + ((value - minValue) / range) * (width - 2 * padding);
      const y = padding + index * ((height - 2 * padding) / (dataPoints - 1));
      return `${x},${y}`;
    });

    if (isArea) {
      const firstPoint = points[0].split(",");
      const lastPoint = points[points.length - 1].split(",");
      return `M ${padding},${height - padding} L ${firstPoint[0]},${firstPoint[1]} L ${points.join(" L ")} L ${lastPoint[0]},${height - padding} Z`;
    }

    if (points.length < 2) return `M ${points.join(" L ")}`;

    let path = `M ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1].split(",").map(Number);
      const [x2, y2] = points[i].split(",").map(Number);
      const cpx = (x1 + x2) / 2;
      const cpy = (y1 + y2) / 2;
      path += ` Q ${cpx},${y1} ${x2},${y2}`;
    }
    return path;
  }

  private getAnimatedDataPoints(chart: ChartData, width: number, height: number): Array<{
    x: number;
    y: number;
    value: number;
    month: number;
    delay: number;
  }> {
    if (!chart || !chart.data?.datasets?.[0]?.data) {
      return [];
    }

    const data = chart.data.datasets[0].data as number[];
    const padding = width * 0.1; // 10% of width for padding
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    const dataPoints = data.length;

    return data.map((value, index) => {
      const x = padding + ((value - minValue) / range) * (width - 2 * padding);
      const y = padding + index * ((height - 2 * padding) / (dataPoints - 1));
      return {
        x,
        y,
        value,
        month: index + 1,
        delay: index * 100,
      };
    });
  }

  private getRadialSegments(chart: ChartData): Array<{
    value: number;
    label: string;
    color: string;
    percentage: number;
    strokeDasharray: string;
    strokeDashoffset: number;
  }> {
    if (!chart || !chart.data?.datasets?.[0]?.data || !chart.data?.labels) {
      return [];
    }

    const data = chart.data.datasets[0].data as number[];
    const labels = chart.data.labels as string[];
    const colors = chart.data.datasets[0].backgroundColor as string[];
    const total = data.reduce((sum, value) => sum + value, 0);
    const circumference = 2 * Math.PI * 120; // Keep radius fixed as in original
    let cumulativePercentage = 0;

    return data.map((value, index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const strokeLength = (percentage / 100) * circumference;
      const offset = circumference - (cumulativePercentage / 100) * circumference;
      cumulativePercentage += percentage;

      return {
        value,
        label: labels[index],
        color: colors?.[index] || this.getDefaultColor(index),
        percentage,
        strokeDasharray: `${strokeLength} ${circumference - strokeLength}`,
        strokeDashoffset: offset,
      };
    });
  }

  private getDefaultColor(index: number): string {
    const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];
    return defaultColors[index % defaultColors.length];
  }

  getAveragePerformance(): number {
    if (!this.chartData?.data?.datasets?.[0]?.data) return 0;
    const data = this.chartData.data.datasets[0].data as number[];
    const sum = data.reduce((a, b) => a + b, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }

  getBestMonth(): { month: number; value: number } {
    if (!this.chartData?.data?.datasets?.[0]?.data) return { month: 1, value: 0 };
    const data = this.chartData.data.datasets[0].data as number[];
    const maxValue = Math.max(...data);
    const maxIndex = data.indexOf(maxValue);
    return { month: maxIndex + 1, value: maxValue };
  }

  getTotalValue(): number {
    if (!this.chartData?.data?.datasets?.[0]?.data) return 0;
    const data = this.chartData.data.datasets[0].data as number[];
    return data.reduce((a, b) => a + b, 0);
  }

  onDataPointHover(index: number): void {
    this.hoveredDataPoint = index;
  }

  onDataPointLeave(): void {
    this.hoveredDataPoint = null;
  }

  getDataPointTooltip(point: any): string {
    return `Month ${point.month}: ${point.value}% Performance`;
  }
}
