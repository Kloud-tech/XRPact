/**
 * Validators Grid - AG-Grid
 *
 * Displays all human validators (XRPL Commons ambassadors) with stats
 */

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { ColDef } from 'ag-grid-community';

interface Validator {
  address: string;
  name: string;
  country: string;
  reputation: number;
  validationsCompleted: number;
  validationsAccepted: number;
  successRate: number;
  rewardsEarned: number;
  specialties: string[];
  status: string;
}

const MOCK_VALIDATORS: Validator[] = [
  {
    address: 'rValidator1XXX',
    name: 'Amadou Diallo',
    country: 'Senegal',
    reputation: 98,
    validationsCompleted: 47,
    validationsAccepted: 46,
    successRate: 97.9,
    rewardsEarned: 2300,
    specialties: ['Water', 'Infrastructure'],
    status: 'ACTIVE',
  },
  {
    address: 'rValidator2XXX',
    name: 'Raj Kumar',
    country: 'India',
    reputation: 94,
    validationsCompleted: 38,
    validationsAccepted: 36,
    successRate: 94.7,
    rewardsEarned: 1800,
    specialties: ['Education', 'Infrastructure'],
    status: 'ACTIVE',
  },
  {
    address: 'rValidator3XXX',
    name: 'Fatou Sow',
    country: 'Senegal',
    reputation: 95,
    validationsCompleted: 42,
    validationsAccepted: 40,
    successRate: 95.2,
    rewardsEarned: 2000,
    specialties: ['Education', 'Health'],
    status: 'ACTIVE',
  },
  {
    address: 'rValidator4XXX',
    name: 'Carlos Silva',
    country: 'Brazil',
    reputation: 91,
    validationsCompleted: 29,
    validationsAccepted: 27,
    successRate: 93.1,
    rewardsEarned: 1350,
    specialties: ['Climate', 'Infrastructure'],
    status: 'ACTIVE',
  },
  {
    address: 'rValidator5XXX',
    name: 'James Omondi',
    country: 'Kenya',
    reputation: 92,
    validationsCompleted: 31,
    validationsAccepted: 29,
    successRate: 93.5,
    rewardsEarned: 1450,
    specialties: ['Health', 'Climate'],
    status: 'ACTIVE',
  },
];

export const ValidatorsGrid: React.FC = () => {
  const columnDefs: ColDef<Validator>[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      filter: 'agTextColumnFilter',
      pinned: 'left',
      cellStyle: { fontWeight: 'bold' },
    },
    {
      field: 'country',
      headerName: 'Country',
      width: 120,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'reputation',
      headerName: 'Reputation',
      width: 130,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: any) => {
        const value = params.value;
        let color = 'text-green-600';
        if (value < 70) color = 'text-red-600';
        else if (value < 85) color = 'text-yellow-600';

        return `<span class="font-bold ${color}">${value}/100</span>`;
      },
      comparator: (valueA: number, valueB: number) => valueB - valueA,
    },
    {
      field: 'validationsCompleted',
      headerName: 'Total Validations',
      width: 160,
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'successRate',
      headerName: 'Success Rate',
      width: 140,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${params.value.toFixed(1)}%`,
      cellStyle: (params) => {
        const value = params.value;
        if (value >= 95) return { color: '#22c55e', fontWeight: 'bold' };
        if (value >= 90) return { color: '#3b82f6', fontWeight: 'bold' };
        return { color: '#f59e0b', fontWeight: 'bold' };
      },
    },
    {
      field: 'rewardsEarned',
      headerName: 'Rewards Earned',
      width: 150,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${params.value.toLocaleString()} XRP`,
      cellStyle: { textAlign: 'right', fontWeight: 'bold', color: '#8b5cf6' },
    },
    {
      field: 'specialties',
      headerName: 'Specialties',
      width: 200,
      valueFormatter: (params) => params.value.join(', '),
      filter: 'agSetColumnFilter',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        const colors: Record<string, string> = {
          ACTIVE: 'bg-green-100 text-green-800',
          INACTIVE: 'bg-gray-100 text-gray-800',
          SUSPENDED: 'bg-red-100 text-red-800',
        };
        return `<span class="px-2 py-1 rounded text-xs font-semibold ${colors[params.value]}">${params.value}</span>`;
      },
    },
    {
      field: 'address',
      headerName: 'XRPL Address',
      width: 180,
      cellRenderer: (params: any) => {
        return `<span class="font-mono text-xs">${params.value.slice(0, 15)}...</span>`;
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
          <h2 className="text-2xl font-bold text-gray-900">Validator Network</h2>
          <p className="text-gray-600">XRPL Commons human oracles worldwide</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            + Add Validator
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Export CSV
          </button>
        </div>
      </div>

      <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
        <AgGridReact
          rowData={MOCK_VALIDATORS}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          domLayout="normal"
          enableCellTextSelection={true}
          ensureDomOrder={true}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          Total Validators: <span className="font-bold">{MOCK_VALIDATORS.length}</span>
        </div>
        <div>
          Avg Reputation: <span className="font-bold text-green-600">
            {(MOCK_VALIDATORS.reduce((sum, v) => sum + v.reputation, 0) / MOCK_VALIDATORS.length).toFixed(1)}
          </span>
        </div>
        <div>
          Total Validations: <span className="font-bold">
            {MOCK_VALIDATORS.reduce((sum, v) => sum + v.validationsCompleted, 0)}
          </span>
        </div>
        <div>
          Total Rewards: <span className="font-bold text-purple-600">
            {MOCK_VALIDATORS.reduce((sum, v) => sum + v.rewardsEarned, 0).toLocaleString()} XRP
          </span>
        </div>
      </div>
    </div>
  );
};
