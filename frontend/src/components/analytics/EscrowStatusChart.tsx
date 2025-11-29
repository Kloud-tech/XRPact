/**
 * Escrow Status Chart - Highcharts Column
 *
 * Shows breakdown of projects by status (Pending, In Progress, Funded, Alert)
 */

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const EscrowStatusChart: React.FC = () => {
  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: 350,
    },
    title: {
      text: 'Project Status Breakdown',
      style: {
        color: '#1f2937',
        fontSize: '18px',
        fontWeight: 'bold',
      },
    },
    subtitle: {
      text: 'Current state of all active escrows',
    },
    xAxis: {
      categories: ['Pending', 'In Progress', 'Funded', 'Alert'],
      labels: {
        style: {
          color: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of Projects',
        style: {
          color: '#6b7280',
        },
      },
      labels: {
        style: {
          color: '#6b7280',
        },
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="padding:0"><b>{point.y}</b> projects</td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
      },
    },
    series: [
      {
        name: 'Projects',
        type: 'column',
        data: [
          { y: 5, color: '#eab308' }, // Yellow - Pending
          { y: 12, color: '#3b82f6' }, // Blue - In Progress
          { y: 28, color: '#22c55e' }, // Green - Funded
          { y: 2, color: '#ef4444' }, // Red - Alert
        ],
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
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
        <div>
          <div className="font-bold text-yellow-600">5</div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div>
          <div className="font-bold text-blue-600">12</div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div>
          <div className="font-bold text-green-600">28</div>
          <div className="text-gray-600">Funded</div>
        </div>
        <div>
          <div className="font-bold text-red-600">2</div>
          <div className="text-gray-600">Alert</div>
        </div>
      </div>
    </div>
  );
};
