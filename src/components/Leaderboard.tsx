import type { ColDef } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import './Leaderboard.css'

type LeaderboardProps = {
    rows: any[];
    cols: any[];
};

export const Leaderboard = ({ rows, cols }: LeaderboardProps) => {
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