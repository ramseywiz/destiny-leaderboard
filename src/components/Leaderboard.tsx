import type { ColDef } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useState } from 'react';
import './Leaderboard.css'



export const Leaderboard = () => {
    const [flipped, setFlipped] = useState<boolean>(false);

    const flipData = () => {
        if (flipped) {
            setFlipped(!flipped)
        } else {
            setFlipped(!flipped);
        }
    }

    const [rowData, setRowData] = useState([
        { name: "Vultorz", class: "Warlock", kills: 23, deaths: true },
        { name: "Logers", class: "Titan", kills: 5932, deaths: false }
    ]);

    const [colDefs, setColDefs] = useState<ColDef<any>[]>([
        { field: "name", flex: 1 },
        { field: "class", flex: 1 },
        { field: "kills", flex: 1 },
        { field: "deaths", flex: 1 }
    ]);

    return (
        <div className="div-wrapper">
            <div className="leaderboard-div">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    theme={themeMaterial}
                />
            </div>
            <button onClick={flipData}>
                flip between two diff content
            </button>
        </div>
    )
}