import requests

def dowload_json(url, output_file):
    response = requests.get(url)
    if response.status_code == 200:
        with open(output_file, 'w') as f:
            f.write(response.text)
        print('Downloaded successfully')
    else:
        print('Download failed')

json_url = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json"

output_file_path = "/Users/jameskendrick/fbball/static/schedule.json"

dowload_json(json_url, output_file_path)