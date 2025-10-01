import type { ColDef } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useState } from 'react';
import './Leaderboard.css'

export const Leaderboard = () => {
    const [flipped, setFlipped] = useState<boolean>(false);

    const data1 = [
        {
            name: "Vultorz",
            class: "Warlock",
            kills: 200000,
            deaths: true
        }
    ]

    const data2 = [
        {
            name: "Logers",
            clan: "VEX",
            kills: 2000,
            persona: true
        }
    ]

    const colD1 = [
        {
            field: "name",
            flex: 1
        },
        {
            field: "clan",
            flex: 1
        },
        {
            field: "kills",
            flex: 1
        },
        {
            field: "persona",
            flex: 1
        }
    ]

    const colD2 = [
        {
            field: "name",
            flex: 1
        },
        {
            field: "class",
            flex: 1
        },
        {
            field: "kills",
            flex: 1
        },
        {
            field: "deaths",
            flex: 1
        }
    ]

    const flipData = () => {
        if (flipped) {
            setFlipped(!flipped);
            setColDefs(colD2);
            setRowData(data1);

        } else {
            setFlipped(!flipped);
            setColDefs(colD1);
            setRowData(data2);
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