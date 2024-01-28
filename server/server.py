import requests
import json
from fastapi import FastAPI
from pydantic import BaseModel, field_validator
from utils import Player


def get_roster(team_name, teams):
        
        for team in teams:
            if team_name.strip() == team['name']:
                return team['roster']['entries']

# Defines the request body
class TeamDataRequest(BaseModel):
    league_id: int
    espn_s2: str | None
    swid: str | None
    team_name: str
    year: int
    fa_count: int

# Defines the response body
class PlayerModelResponse(BaseModel):
    name: str
    avg_points: float
    team: str
    valid_positions: list[str]
    injured: bool

    @field_validator("team")
    @classmethod
    def correct_team_name(cls, v):
        corretions = {
            "PHL": "PHI",
            "PHO": "PHX",
        }
        return corretions.get(v, v)

    @field_validator("valid_positions", mode="before")
    @classmethod
    def keep_valid_positions(cls, v, values, **kwargs):
        values_to_keep = {"PG", "SG", "SF", "PF", "C", "G", "F"}
        return [pos for pos in v if pos in values_to_keep] + ["UT1", "UT2", "UT3"]
 

app = FastAPI()

# Returns important data for players on a team
@app.post("/get_roster_data/")
async def get_team_data(req: TeamDataRequest):

    params = {
            'view': ['mTeam', 'mRoster', 'mMatchup', 'mSettings', 'mStandings']
        }
    
    endpoint = f'https://fantasy.espn.com/apis/v3/games/fba/seasons/{req.year}/segments/0/leagues/{req.league_id}'
    data = requests.get(endpoint, params=params).json()
    roster = get_roster(req.team_name, data['teams'])
    players = [Player(player, req.year) for player in roster]

    return [PlayerModelResponse(name=player.name,
                                avg_points=player.avg_points,
                                team=player.proTeam,
                                valid_positions=player.eligibleSlots,
                                injured=player.injured,
                                ) for player in players]
    
    
            


# Returns important data for free agents in a league
@app.post("/get_freeagent_data/")
def get_free_agents(req: TeamDataRequest):

    params = {
        'view': 'kona_player_info',
        'scoringPeriodId': 0,
    }

    filters = {"players":{"filterStatus":{"value":["FREEAGENT","WAIVERS"]},"filterSlotIds":{"value":[]},"limit":req.fa_count,"sortPercOwned":{"sortPriority":1,"sortAsc":False},"sortDraftRanks":{"sortPriority":100,"sortAsc":True,"value":"STANDARD"}}}
    headers = {'x-fantasy-filter': json.dumps(filters)}

    endpoint = f'https://fantasy.espn.com/apis/v3/games/fba/seasons/{req.year}/segments/0/leagues/{req.league_id}'
    data = requests.get(endpoint, params=params, headers=headers).json()
    players = [Player(player, req.year) for player in data['players']]

    return [PlayerModelResponse(name=player.name,
                                avg_points=player.avg_points,
                                team=player.proTeam,
                                valid_positions=player.eligibleSlots,
                                injured=player.injured,
                                ) for player in players]