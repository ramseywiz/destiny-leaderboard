import { AddRowButton } from "../components/AddRowButton";
import { Leaderboard } from "../components/Leaderboard";
import "./Board.css"
import { useState } from "react";
import type { ColDef } from "ag-grid-community";

export const Board = () => {
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

    const handleAddRow = () => {
        const newRow = {
            name: "Guardian",
            class: "Hunter",
            kills: 0,
            deaths: false
        };
        setRowData([...rowData, newRow]);
    };

    return (
        <div>
            <AddRowButton onClick={handleAddRow} />
            <div className="div-wrapper">
                <Leaderboard rows={rowData} cols={colDefs} />
            </div>
        </div>
    );
}