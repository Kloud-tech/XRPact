/**
 * Projects Grid - AG-Grid
 *
 * Displays all projects with advanced filtering, sorting, and export
 */

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { ColDef } from 'ag-grid-community';

interface Project {
  id: string;
  title: string;
  category: string;
  country: string;
  amount: number;
  status: string;
  validatorsApproved: number;
  validatorsRequired: number;
  daysRemaining?: number;
  escrowHash?: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ_001',
    title: 'Puits au Sénégal',
    category: 'Water',
    country: 'Senegal',
    amount: 5000,
    status: 'FUNDED',
    validatorsApproved: 3,
    validatorsRequired: 3,
    escrowHash: '0xABC123',
  },
  {
    id: 'PRJ_002',
    title: 'École en Inde',
    category: 'Education',
    country: 'India',
    amount: 8000,
    status: 'IN_PROGRESS',
    validatorsApproved: 1,
    validatorsRequired: 3,
    daysRemaining: 45,
    escrowHash: '0xDEF456',
  },
  {
    id: 'PRJ_003',
    title: 'Clinique au Kenya',
    category: 'Health',
    country: 'Kenya',
    amount: 12000,
    status: 'ALERT',
    validatorsApproved: 0,
    validatorsRequired: 3,
    daysRemaining: -5,
    escrowHash: '0xGHI789',
  },
  {
    id: 'PRJ_004',
    title: 'Reforestation Brésil',
    category: 'Climate',
    country: 'Brazil',
    amount: 15000,
    status: 'IN_PROGRESS',
    validatorsApproved: 3,
    validatorsRequired: 5,
    daysRemaining: 60,
  },
  {
    id: 'PRJ_005',
    title: 'Panneaux Solaires Vietnam',
    category: 'Infrastructure',
    country: 'Vietnam',
    amount: 10000,
    status: 'PENDING',
    validatorsApproved: 0,
    validatorsRequired: 3,
    daysRemaining: 90,
  },
];

export const ProjectsGrid: React.FC = () => {
  const columnDefs: ColDef<Project>[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 120,
      filter: 'agTextColumnFilter',
      pinned: 'left',
    },
    {
      field: 'title',
      headerName: 'Project Title',
      width: 200,
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: 'bold' },
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        const icons: Record<string, string> = {
          Water: '💧',
          Education: '📚',
          Health: '❤️',
          Climate: '🌱',
          Infrastructure: '🏗️',
        };
        return `${icons[params.value] || ''} ${params.value}`;
      },
    },
    {
      field: 'country',
      headerName: 'Country',
      width: 120,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'amount',
      headerName: 'Amount (XRP)',
      width: 140,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value.toLocaleString() + ' XRP',
      cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        const colors: Record<string, string> = {
          FUNDED: 'bg-green-100 text-green-800',
          IN_PROGRESS: 'bg-blue-100 text-blue-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
          ALERT: 'bg-red-100 text-red-800',
        };
        return `<span class="px-2 py-1 rounded text-xs font-semibold ${colors[params.value]}">${params.value}</span>`;
      },
    },
    {
      field: 'validatorsApproved',
      headerName: 'Validators',
      width: 130,
      valueGetter: (params) =>
        `${params.data?.validatorsApproved}/${params.data?.validatorsRequired}`,
    },
    {
      field: 'daysRemaining',
      headerName: 'Days Left',
      width: 120,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: any) => {
        if (params.value === undefined) return '-';
        if (params.value < 0) {
          return `<span class="text-red-600 font-bold">${params.value} (overdue)</span>`;
        }
        return params.value;
      },
    },
    {
      field: 'escrowHash',
      headerName: 'Escrow Hash',
      width: 150,
      cellRenderer: (params: any) => {
        if (!params.value) return '-';
        return `<a href="https://testnet.xrpl.org/transactions/${params.value}" target="_blank" class="text-blue-600 hover:underline">${params.value.slice(0, 10)}...</a>`;
      },
    },
  ], []);

  const defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
          <p className="text-gray-600">Manage and track all active escrows</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Export CSV
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
        <AgGridReact
          rowData={MOCK_PROJECTS}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          domLayout="normal"
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total Projects: <span className="font-bold">{MOCK_PROJECTS.length}</span>
      </div>
    </div>
  );
};
