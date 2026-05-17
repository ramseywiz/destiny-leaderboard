import { useState } from "react";
import { bungieRequest } from "../../api/bungie-api-helper";
import type { BungieResponse, UserInfoCard } from "../../enums/bungie-api-enums";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState("ram");
    const [code, setCode] = useState("2028");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const profile = await bungieRequest<BungieResponse<UserInfoCard[]>>("/Destiny2/SearchDestinyPlayerByBungieName/-1/", {
                method: "POST",
                body: JSON.stringify({
                    displayName: name,
                    displayNameCode: code,
                })
            });

            const profileRes = profile.Response[0];

            const membershipType = profileRes.membershipType;
            const destinyMembershipId = profileRes.membershipId;

            navigate(`/report/${membershipType}/${destinyMembershipId}`);
        }
        catch (e) {
            console.error(e);
        }

        setIsSubmitting(false);
    }
    return (
        <div>
            <h1>Destiny Leaderboard</h1>
            <button onClick={() => setIsDialogOpen(true)}>Search Player</button>
            {isDialogOpen && (
                <div>
                    <p>Dialog Content Here</p>
                    <input
                        type="text"
                        value={name}
                        onChange={(x) => setName(x.target.value)}
                        placeholder="Bungie Name"
                        disabled={isSubmitting}
                    />
                    <input
                        type="text"
                        value={code}
                        onChange={(x) => setCode(x.target.value)}
                        placeholder="Bungie Code"
                        disabled={isSubmitting}
                    />
                    <button onClick={handleSubmit}>Submit</button>
                    <br />
                    <br />
                    <button onClick={() => setIsDialogOpen(false)}>Close</button>
                </div>
            )}
        </div>
    );
}