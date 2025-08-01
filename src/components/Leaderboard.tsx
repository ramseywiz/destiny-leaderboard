import type { ColDef } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useState } from 'react';
import './Leaderboard.css'



export const Leaderboard = () => {
    const [rowData, setRowData] = useState([
        { name: "Vultorz", class: "Warlock", kills: 23, deaths: true },
        { name: "Logers", class: "Titan", kills: 5932, deaths: false }
    ]);

    const [colDefs, setColDefs] = useState<ColDef<any>[]>([
        { field: "name" },
        { field: "class" },
        { field: "kills" },
        { field: "deaths" }
    ]);

    return (
        <div className="leaderboard-div">
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                theme={themeMaterial}
            />
        </div>
    )
}