export interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  subLabel?: string;
  icon: React.ElementType;
  colorClass: string;
  viewMoreUrl?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export enum VehicleStatus {
  OverSpeeding = 'Over Speeding',
  Running = 'Running',
  Standing = 'Standing',
  Stopped = 'Stopped',
  DataNotReceiving = 'Data Not Receiving'
}

export interface InsightResponse {
  summary: string;
  recommendations: string[];
}