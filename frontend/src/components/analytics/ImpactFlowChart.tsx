/**
 * Impact Flow Chart - Highcharts Pie/Donut
 *
 * Shows distribution of funds from Donations → Pool → Projects
 */

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const ImpactFlowChart: React.FC = () => {
  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 400,
    },
    title: {
      text: 'Fund Distribution',
      style: {
        color: '#1f2937',
        fontSize: '18px',
        fontWeight: 'bold',
      },
    },
    subtitle: {
      text: 'How donations are allocated',
    },
    tooltip: {
      pointFormat: '<b>{point.percentage:.1f}%</b><br/>{point.y} XRP',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: {
            color: '#374151',
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: 'Distribution',
        type: 'pie',
        innerSize: '50%', // Donut chart
        data: [
          {
            name: 'Water Projects',
            y: 35000,
            color: '#3b82f6',
          },
          {
            name: 'Education',
            y: 25000,
            color: '#8b5cf6',
          },
          {
            name: 'Health',
            y: 20000,
            color: '#ef4444',
          },
          {
            name: 'Climate',
            y: 15000,
            color: '#22c55e',
          },
          {
            name: 'Infrastructure',
            y: 10000,
            color: '#f59e0b',
          },
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};
