import axios from 'axios';

interface LeagueCheckerRequest {
    league_id: number;
    espn_s2?: string;  
    swid?: string; 
    team_name: string;
    year: number;
}

export async function getLeague(leagueid: string, leagueyear: string, teamname: string, s2: string, swid: string) {
    const request: LeagueCheckerRequest = {
        league_id: parseInt(leagueid),
        espn_s2: s2,
        swid: swid,
        team_name: teamname,
        year: parseInt(leagueyear)
    };

    axios.post('http://127.0.0.1:8000/validate_league', request)
        .then((response) => {
            console.log(response);
            console.log("Found league");
            return true;
        })
        .catch((error) => {
            console.log(error);
            console.log("Error finding league");
            return false;
        });

    return false;
}
