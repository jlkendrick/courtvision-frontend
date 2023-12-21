import json
from datetime import datetime
from collections import defaultdict

def load_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

json_file_path = "/Users/jameskendrick/nba/static/schedule.json"
data = load_json_file(json_file_path)

schedule = {}
cur_week = 0
passed = False
weeks = data["leagueSchedule"]["weeks"]
for week in weeks[:-1]:
    cur_week += 1
    if cur_week == 17:
        passed = True
        continue
    if passed:
        orig_date = datetime.strptime(week["endDate"], "%Y-%m-%dT%H:%M:%SZ")
        new_date = orig_date.strftime("%m/%d/%Y %H:%M:%S")
        schedule[cur_week - 1] = {"endDate": new_date}
    else:
        orig_date = datetime.strptime(week["endDate"], "%Y-%m-%dT%H:%M:%SZ")
        new_date = orig_date.strftime("%m/%d/%Y %H:%M:%S")
        schedule[cur_week] = {"endDate": new_date}


season_start = datetime.strptime("10/24/2023 00:00:00", "%m/%d/%Y %H:%M:%S")
game_dates = data["leagueSchedule"]["gameDates"]
cur_week = 1
date_format = "%m/%d/%Y %H:%M:%S"

games_in_week = defaultdict(list)
for game_date in game_dates:
    test_date = datetime.strptime(game_date["gameDate"], date_format)
    actual_date = datetime.strptime(schedule[cur_week]["endDate"], date_format)
    if test_date <= season_start:
        continue
    elif test_date <= actual_date:
        for game in game_date["games"]:
            games_in_week[game["homeTeam"]["teamName"]].append(test_date.strftime("%m-%d-%Y"))
            games_in_week[game["awayTeam"]["teamName"]].append(test_date.strftime("%m-%d-%Y"))
    else:
        schedule[cur_week]["games"] = games_in_week
        games_in_week = defaultdict(list)
        cur_week += 1
        for game in game_date["games"]:
            games_in_week[game["homeTeam"]["teamName"]].append(test_date.strftime("%m-%d-%Y"))
            games_in_week[game["awayTeam"]["teamName"]].append(test_date.strftime("%m-%d-%Y"))

with open("/Users/jameskendrick/nba/static/schedule.json", "w") as file:
    json.dump(schedule, file, indent=4)
