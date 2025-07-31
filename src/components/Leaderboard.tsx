import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useState } from 'react';


export const Leaderboard = () => {
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([
        { name: "Vultorz", class: "Warlock", kills: 23, deaths: 300 },
        { name: "Logers", class: "Titan", kills: 5932, deaths: 256 }
    ]);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState<ColDef<any>[]>([
        { field: "name" },
        { field: "class" },
        { field: "kills" },
        { field: "deaths" }
    ]);

    return (
        <div className="ag-theme-alpine" style={{ height: 500 }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
            />
        </div>
    )
}