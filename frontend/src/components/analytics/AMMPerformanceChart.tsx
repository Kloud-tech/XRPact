/**
 * AMM Performance Chart - Highcharts
 *
 * Shows pool balance growth over time from AMM trading fees
 */

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface AMMPerformanceChartProps {
  data?: Array<{ date: string; balance: number }>;
}

export const AMMPerformanceChart: React.FC<AMMPerformanceChartProps> = ({ data }) => {
  // Mock data if not provided
  const mockData = data || generateMockData();

  const options: Highcharts.Options = {
    chart: {
      type: 'area',
      backgroundColor: 'transparent',
      height: 350,
    },
    title: {
      text: 'Pool Balance Growth (AMM Fees)',
      style: {
        color: '#1f2937',
        fontSize: '18px',
        fontWeight: 'bold',
      },
    },
    subtitle: {
      text: '30-day rolling performance',
      style: {
        color: '#6b7280',
      },
    },
    xAxis: {
      categories: mockData.map(d => d.date),
      labels: {
        style: {
          color: '#6b7280',
        },
      },
    },
    yAxis: {
      title: {
        text: 'Balance (XRP)',
        style: {
          color: '#6b7280',
        },
      },
      labels: {
        style: {
          color: '#6b7280',
        },
        formatter: function() {
          return `${(this.value as number).toLocaleString()} XRP`;
        },
      },
    },
    tooltip: {
      shared: true,
      formatter: function() {
        return `<b>${this.x}</b><br/>Balance: <b>${(this.y as number).toLocaleString()} XRP</b>`;
      },
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(34, 197, 94, 0.3)'],
            [1, 'rgba(34, 197, 94, 0.05)'],
          ],
        },
        marker: {
          radius: 3,
        },
        lineWidth: 2,
        lineColor: '#22c55e',
        states: {
          hover: {
            lineWidth: 3,
          },
        },
        threshold: null,
      },
    },
    series: [
      {
        name: 'Pool Balance',
        type: 'area',
        data: mockData.map(d => d.balance),
        color: '#22c55e',
      },
    ],
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <HighchartsReact highcharts={Highcharts} options={options} />
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {mockData[mockData.length - 1].balance.toLocaleString()} XRP
          </div>
          <div className="text-sm text-gray-600">Current Balance</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600">
            +{(mockData[mockData.length - 1].balance - mockData[0].balance).toLocaleString()} XRP
          </div>
          <div className="text-sm text-gray-600">Fees Earned (30d)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {(((mockData[mockData.length - 1].balance - mockData[0].balance) / mockData[0].balance) * 12 * 100).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600">Projected APY</div>
        </div>
      </div>
    </div>
  );
};

function generateMockData() {
  const data = [];
  let balance = 100000;

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));

    // Simulate daily fee accumulation (0.1% per day)
    balance += balance * 0.001;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: Math.round(balance),
    });
  }

  return data;
}
