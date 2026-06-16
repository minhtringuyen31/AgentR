/* eslint-disable no-unused-vars */
export interface IApexChartOptions {
  series:
    | number[]
    | {
        name?: string;
        data: number[] | any[];
      }[];
  chart: {
    height?: number;
    type: 'area' | 'donut' | 'line';
    toolbar?: {
      show: boolean;
    };
  };
  dataLabels?: {
    enabled: boolean;
  };
  labels?: string[];
  colors?: string | string[];
  legend?: {
    show?: boolean;
    offsetY?: number;
    offsetX?: number;
    fontSize?: string;
    fontWeight?: string;
    itemMargin?: {
      vertical: number;
    };
    labels?: {
      colors: string | string[];
      useSeriesColors?: boolean;
    };
    markers?: {
      width?: number;
      height?: number;
    };
  };
  stroke?: {
    curve?: 'smooth' | 'straight';
    show?: boolean;
    width?: number;
    colors?: string | string[];
  };
  xaxis?: {
    categories?: string[];
    axisBorder?: {
      show: boolean;
    };
    maxTicks?: number;
    axisTicks?: {
      show: boolean;
    };
    labels?: {
      style: {
        colors: string;
        fontSize: string;
      };
    };
    crosshairs?: {
      position?: string;
      stroke?: {
        color: string;
        width: number;
        dashArray: number;
      };
    };
    tooltip?: {
      enabled: boolean;
      formatter?: undefined;
      offsetY?: number;
      style?: {
        fontSize: string;
      };
    };
  };
  yaxis?: {
    min?: number;
    max?: number;
    tickAmount?: number;
    axisTicks?: {
      show: boolean;
    };
    labels?: {
      style: {
        colors: string;
        fontSize: string;
      };
      formatter?: (defaultValue: number) => string;
    };
  };
  tooltip?: {
    enabled: boolean;
    custom?: ({ series, seriesIndex, dataPointIndex, w }: any) => string;
  };
  markers?: {
    size?: number;
    colors?: string;
    strokeColors?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeDashArray?: number;
    fillOpacity?: number;
    discrete?: any[];
    shape?: string;
    radius?: number;
    offsetX?: number;
    offsetY?: number;
    onClick?: undefined;
    onDblClick?: undefined;
    showNullDataPoints?: boolean;
    hover?: {
      size?: number;
      sizeOffset?: number;
    };
  };
  fill?: {
    colors?: string | string[];
    gradient?: {
      enabled: boolean;
      opacityFrom: number;
      opacityTo: number;
    };
  };
  grid?: {
    borderColor?: string;
    strokeDashArray?: number;
    clipMarkers?: boolean;
    yaxis?: {
      lines?: {
        show: boolean;
      };
    };
    xaxis?: {
      lines?: {
        show: boolean;
      };
    };
  };
  plotOptions?: {
    pie?: {
      expandOnClick: boolean;
    };
  };
  responsive?: {
    breakpoint: number;
    options: {
      chart: {
        width: number;
      };
      legend: {
        position: string;
      };
    };
  }[];
}
