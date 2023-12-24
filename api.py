from fastapi import FastAPI
from pydantic import BaseModel
from espn_api.basketball import League

# Find a team in a list of teams
def find_team(team_name, teams):
    for team in teams:
        if team.team_name == team_name:
            return team
    return None

app = FastAPI()

# Defines the request body
class TeamDataRequest(BaseModel):
    league_id: int
    team_name: str
    year: int

# Defines the response body
class PlayerModelResponse(BaseModel):
    name: str
    avg_points: float
    team: str
    injury_status: str
    valid_positions: list[str]

# Returns important data for players on a team
@app.post("/get_roster_data/")
async def get_team_data(req: TeamDataRequest):
    league = League(req.league_id, req.year)
    team = find_team(req.team_name, league.teams)
    roster = team.roster
    return [PlayerModelResponse(name=player.name, 
                                avg_points=player.avg_points,
                                team=player.proTeam,
                                injury_status=player.injuryStatus,
                                valid_positions=player.eligibleSlots
                                ) for player in roster]

# Returns important data for free agents in a league
@app.post("/get_freeagent_data/")
async def get_free_agents(req: TeamDataRequest):
    league = League(req.league_id, req.year)
    free_agents = league.free_agents()
# TODO: Filter out players below a certain threshold on avg_points basis
    return [PlayerModelResponse(name=player.name, 
                                avg_points=player.avg_points,
                                team=player.proTeam,
                                injury_status=player.injuryStatus,
                                valid_positions=player.eligibleSlots
                                ) for player in free_agents]

# my_team = league.teams[0]
# my_roster = my_team.roster
# my_player = my_roster[1]

# print(my_player.name)
# print(my_player.proTeam)
# print(my_player.avg_points)
# print(my_player.injuryStatus)
# print(my_player.eligibleSlots)

# free_agents = league.free_agents()

# for player in free_agents[:5]:
#     stats = player.stats
#     print(player.avg_points)
