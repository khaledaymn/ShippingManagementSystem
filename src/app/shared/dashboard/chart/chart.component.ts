import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChartData } from "../../dashboard/dashboard.component";

@Component({
  selector: "app-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"],
})
export class ChartComponent implements OnChanges {
  @Input() chartData!: ChartData;
  maxValue: number = 0;
  doughnutTotal: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData?.data?.length) {
      this.maxValue = Math.max(...this.chartData.data);
      this.doughnutTotal = this.chartData.data.reduce((a, b) => a + b, 0);
    }
  }

  get isValidChartData(): boolean {
    return !!this.chartData &&
           !!this.chartData.data &&
           !!this.chartData.labels &&
           this.chartData.data.length > 0 &&
           this.chartData.data.length === this.chartData.labels.length;
  }

  getChartTypeClass(): string {
    return `chart-${this.chartData.type}`;
  }

  get linePoints(): string {
    if (!this.isValidChartData) return "";
    return this.chartData.data
      .map((value, index) => `${index * 50},${150 - (value / (this.maxValue || 1) * 120)}`)
      .join(' ');
  }

  get areaPoints(): string {
    if (!this.isValidChartData) return "";
    return `0,150 ${this.linePoints} 300,150`;
  }

  get circlePoints(): { cx: number; cy: number }[] {
    if (!this.isValidChartData) return [];
    return this.chartData.data.map((value, index) => ({
      cx: index * 50,
      cy: 150 - (value / (this.maxValue || 1) * 120),
    }));
  }

  getBarHeight(value: number): number {
    if (!this.isValidChartData) return 0;
    return (value / (this.maxValue || 1)) * 100;
  }

  getDoughnutSegments(): { percentage: number; offset: number }[] {
    if (!this.isValidChartData) return [];
    const total = this.chartData.data.reduce((a, b) => a + b, 0);
    let accumulatedOffset = 0;
    return this.chartData.data.map((value) => {
      const percentage = (value / (total || 1)) * 100;
      const segment = { percentage, offset: accumulatedOffset };
      accumulatedOffset += percentage;
      return segment;
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
