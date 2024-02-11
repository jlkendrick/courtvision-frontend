import json
from datetime import datetime
from collections import defaultdict

def load_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

json_file_path = "/Users/jameskendrick/fbball/static/schedule.json"
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
        orig_start_date = datetime.strptime("2024-02-12T00:00:00Z", "%Y-%m-%dT%H:%M:%SZ") if cur_week == 18 else datetime.strptime(week["startDate"], "%Y-%m-%dT%H:%M:%SZ")
        new_start_date = orig_start_date.strftime("%m/%d/%Y")
        orig_end_date = datetime.strptime(week["endDate"], "%Y-%m-%dT%H:%M:%SZ")
        new_end_date = orig_end_date.strftime("%m/%d/%Y")
        game_span = (orig_end_date - orig_start_date).days
        schedule[cur_week - 1] = {"startDate": new_start_date,
                                  "endDate": new_end_date,
                                  "gameSpan": game_span}
    else:
        orig_start_date = datetime.strptime(week["startDate"], "%Y-%m-%dT%H:%M:%SZ")
        new_start_date = orig_start_date.strftime("%m/%d/%Y")
        orig_end_date = datetime.strptime(week["endDate"], "%Y-%m-%dT%H:%M:%SZ")
        new_end_date = orig_end_date.strftime("%m/%d/%Y")
        game_span = (orig_end_date - orig_start_date).days
        schedule[cur_week] = {"startDate": new_start_date,
                              "endDate": new_end_date,
                              "gameSpan": game_span}


season_start = datetime.strptime("10/24/2023", "%m/%d/%Y")
game_dates = data["leagueSchedule"]["gameDates"]
cur_week = 1
date_format = "%m/%d/%Y %H:%M:%S"

games_in_week = defaultdict(list)
for game_date in game_dates:
    test_date = datetime.strptime(game_date["gameDate"], date_format)
    test_date = test_date.strftime("%m/%d/%Y")
    test_date = datetime.strptime(test_date, "%m/%d/%Y")
    week_start_date = datetime.strptime(schedule[cur_week]["startDate"], "%m/%d/%Y")
    week_end_date = datetime.strptime(schedule[cur_week]["endDate"], "%m/%d/%Y")
    if test_date < season_start:
        continue
    elif test_date <= week_end_date:
        days_since = (test_date - week_start_date).days
        for game in game_date["games"]:
            games_in_week[game["homeTeam"]["teamTricode"]].append(days_since)
            games_in_week[game["awayTeam"]["teamTricode"]].append(days_since)
    else:
        schedule[cur_week]["games"] = games_in_week
        games_in_week = defaultdict(list)
        cur_week += 1
        for game in game_date["games"]:
            games_in_week[game["homeTeam"]["teamTricode"]].append(0)
            games_in_week[game["awayTeam"]["teamTricode"]].append(0)

with open("/Users/jameskendrick/fbball/static/schedule.json", "w") as file:
    json.dump(schedule, file, indent=4)
