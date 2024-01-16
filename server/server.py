import requests
import json
from fastapi import FastAPI
from pydantic import BaseModel
from espn_api.utils.utils import json_parsing
import constant as C

# Find a team in a list of teams
def find_team(team_name, teams):
    for team in teams:
        if team.team_name == team_name:
            return team
    return None

# Converts a stat id to a more readable format
def stat_id_pretty(id: str, scoring_period):
    id_type = C.Constants.STAT_ID_MAP.get(id[:2])
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

app = FastAPI()

# Returns important data for players on a team
# @app.post("/get_roster_data/")
# async def get_team_data(req: TeamDataRequest):

#     params = {
#         'view': "mRoster",
#         'forTeamId': 0,
#     }
    

# Returns important data for free agents in a league
@app.post("/get_freeagent_data/")
def get_free_agents(req: TeamDataRequest):

    params = {
        'view': 'kona_player_info',
        'scoringPeriodId': 0,
    }

    filters = {"players":{"filterStatus":{"value":["FREEAGENT","WAIVERS"]},"filterSlotIds":{"value":[]},"limit":100,"sortPercOwned":{"sortPriority":1,"sortAsc":False},"sortDraftRanks":{"sortPriority":100,"sortAsc":True,"value":"STANDARD"}}}
    headers = {'x-fantasy-filter': json.dumps(filters)}

    endpoint = f'https://fantasy.espn.com/apis/v3/games/fba/seasons/2024/segments/0/leagues/{req.league_id}'
    r = requests.get(endpoint, params=params, headers=headers)

    return [PlayerModelResponse(name=(json_parsing(player, 'fullName')),
                                avg_points=(get_average_points(player['playerPoolEntry']['player'] if 'playerPoolEntry' in player else player['player'], 2024)),
                                team=(C.Constants.PRO_TEAM_MAP[json_parsing(player, 'proTeamId')]),
                                injury_status=str((json_parsing(player, 'injuryStatus'))),
                                valid_positions=([C.Constants.POSITION_MAP[pos] for pos in json_parsing(player, 'eligibleSlots')]),
                                ) for player in r.json()['players']]