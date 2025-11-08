// FIX: Import React to provide the React.ReactNode type.
import React from 'react';

export interface StockData {
  name: string;
  marketCap: number;
  price: number;
  change: number;
}

export interface StockDataWithPercentage extends StockData {
  percentage: number;
}

export interface LayoutItem extends StockDataWithPercentage {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
}

export interface TooltipData {
  visible: boolean;
  content: React.ReactNode;
  x: number;
  y: number;
}
