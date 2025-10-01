import type { ColDef } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import './Leaderboard.css'

export const Leaderboard = (rows, cols) => {
    return (
        <div className="leaderboard-div">
            <AgGridReact
                rowData={rows}
                columnDefs={cols}
                theme={themeMaterial}
            />
        </div>

    )
}