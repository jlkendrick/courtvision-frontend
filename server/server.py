import requests
import json
from fastapi import FastAPI
from pydantic import BaseModel, field_validator
from espn_api.utils.utils import json_parsing
from utils import POSITION_MAP, PRO_TEAM_MAP, STAT_ID_MAP

# Find a team in a list of teams
def find_team(team_name, teams):
    for team in teams:
        if team.team_name == team_name:
            return team
    return None

# Converts a stat id to a more readable format
def stat_id_pretty(id: str, scoring_period):
    id_type = STAT_ID_MAP.get(id[:2])
    return f'{id[2:]}_{id_type}' if id_type else str(scoring_period)

# Returns the average points for a player in a given year
def get_average_points(player, year):
    stats = {}
    for split in player.get('stats', []):
        if split.get('seasonId') == year:
            id = stat_id_pretty(split['id'], split['scoringPeriodId'])
            applied_total = split.get('appliedTotal', 0)
            applied_avg =  round(split.get('appliedAverage', 0), 2)
            stats[id] = dict(applied_total=applied_total, applied_avg=applied_avg)
            return stats.get(f'{year}_total', {}).get('applied_avg', 0)
        
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

# Defines the response body
class PlayerModelResponse(BaseModel):
    name: str
    avg_points: float
    team: str
    injury_status: str
    valid_positions: list[str]

    @field_validator("valid_positions", mode="before")
    @classmethod
    def keep_valid_positions(cls, v, values, **kwargs):
        values_to_keep = {"PG", "SG", "SF", "PF", "C", "G", "F"}
        return [pos for pos in v if pos in values_to_keep] + ["BE1", "BE2", "BE3", "UT1", "UT2", "UT3"]
 

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

    return [PlayerModelResponse(name=(json_parsing(player, 'fullName')),
                                avg_points=(get_average_points(player['playerPoolEntry']['player'] if 'playerPoolEntry' in player else player['player'], 2024)),
                                team=(PRO_TEAM_MAP[json_parsing(player, 'proTeamId')]),
                                injury_status=str((json_parsing(player, 'injuryStatus'))),
                                valid_positions=([POSITION_MAP[pos] for pos in json_parsing(player, 'eligibleSlots')]),
                                ) for player in roster]
    
    
            


# Returns important data for free agents in a league
@app.post("/get_freeagent_data/")
def get_free_agents(req: TeamDataRequest):

    params = {
        'view': 'kona_player_info',
        'scoringPeriodId': 0,
    }

    filters = {"players":{"filterStatus":{"value":["FREEAGENT","WAIVERS"]},"filterSlotIds":{"value":[]},"limit":100,"sortPercOwned":{"sortPriority":1,"sortAsc":False},"sortDraftRanks":{"sortPriority":100,"sortAsc":True,"value":"STANDARD"}}}
    headers = {'x-fantasy-filter': json.dumps(filters)}

    endpoint = f'https://fantasy.espn.com/apis/v3/games/fba/seasons/{req.year}/segments/0/leagues/{req.league_id}'
    data = requests.get(endpoint, params=params, headers=headers).json()

    return [PlayerModelResponse(name=(json_parsing(player, 'fullName')),
                                avg_points=(get_average_points(player['playerPoolEntry']['player'] if 'playerPoolEntry' in player else player['player'], 2024)),
                                team=(PRO_TEAM_MAP[json_parsing(player, 'proTeamId')]),
                                injury_status=str((json_parsing(player, 'injuryStatus'))),
                                valid_positions=([POSITION_MAP[pos] for pos in json_parsing(player, 'eligibleSlots')]),
                                ) for player in data['players']]