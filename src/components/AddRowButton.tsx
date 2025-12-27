import './AddRowButton.css';

type AddRowButtonProps = {
    onClick: () => void;
};

export const AddRowButton = ({ onClick }: AddRowButtonProps) => {
    return (
        <div className='addRowDiv'>
            <button onClick={onClick}>
                Add Row
            </button>
        </div>
    )
};