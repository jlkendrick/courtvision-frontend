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

# Returns important data for players on a team
@app.post("/get_roster_data/")
async def get_team_data(req: TeamDataRequest):
    league = League(req.league_id, 
                    req.year, 
                    espn_s2=req.espn_s2 if req.espn_s2 else None, 
                    swid=req.swid if req.swid else None)
    team = find_team(req.team_name, league.teams)
    roster = team.roster
    values_to_keep = {"PG", "SG", "SF", "PF", "C", "G", "F", "UT", "BE"}
    return [PlayerModelResponse(name=player.name,
                                avg_points=player.avg_points,
                                team=player.proTeam if player.proTeam != "PHL" else "PHI",
                                injury_status=player.injuryStatus,
                                valid_positions=([pos for pos in player.eligibleSlots if pos in values_to_keep] + ["IR"]) if player.injuryStatus == "OUT" else [pos for pos in player.eligibleSlots if pos in values_to_keep]
                                ) for player in roster]

# Returns important data for free agents in a league
@app.post("/get_freeagent_data/")
async def get_free_agents(req: TeamDataRequest):
    league = League(req.league_id, 
                    req.year, 
                    espn_s2=req.espn_s2 if req.espn_s2 else None, 
                    swid=req.swid if req.swid else None)
    free_agents = league.free_agents()
    values_to_keep = {"PG", "SG", "SF", "PF", "C", "G", "F", "UT", "BE"}
    return [PlayerModelResponse(name=player.name,
                                avg_points=player.avg_points,
                                team=player.proTeam,
                                injury_status=player.injuryStatus,
                                valid_positions=([pos for pos in player.eligibleSlots if pos in values_to_keep] + ["IR"]) if player.injuryStatus == "OUT" else [pos for pos in player.eligibleSlots if pos in values_to_keep]
                                ) for player in free_agents if player.avg_points > 15.0]
