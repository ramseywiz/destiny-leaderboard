import PlayerCard from '../card/PlayerCard';
import './Leaderboard.css'

export const Leaderboard = () => {
    return (
        <div className='leaderboard'>
            <p>
                Leaderboard!
            </p>
            <PlayerCard />
        </div>
    );
};

export default Leaderboard;