import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

def getNumberOfGames():
    url = "https://api.igdb.com/v4/games/count"
    headers = {
    "Client-ID": os.getenv("CLIENT_ID"),
    "Authorization": f"Bearer {os.getenv('TWITCH_ACCESS')}"
    }
    
    response = requests.post(url, headers=headers)
    print(response.json())  # Prints total game count
    return response.json()["count"]

def refreshAccess():

    twitchLink = "https://id.twitch.tv/oauth2/token"

    form = {
        'client_id': 'c9amzjhdtblmmr4yl5rxd2obhs085u',
        'client_secret': 'k20531f7b259ctkeelqvvqk2ldz95a',
        'grant_type': 'client_credentials',
    }
    
    accessResponse = requests.post(twitchLink, data=form)
    access = accessResponse.json()['access_token']
    logging.info(access)
    return access

def getDatabase():
    access = os.getenv('TWITCH_ACCESS')
    apiUrl = 'https://api.igdb.com/v4/games'
    offset = 0
    headers = {
        'Client-ID': 'c9amzjhdtblmmr4yl5rxd2obhs085u',
        'Authorization': f"bearer {access}",
    }
    responseList = []
    while True:
        body = f"fields *; where category = 0 & platforms = (4, 5, 7, 8, 9, 11, 12, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 32, 33, 35, 37, 38, 41, 42, 44, 46, 48, 49, 50, 51, 52, 53, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 75, 77, 78, 79, 80, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 99, 101, 102, 104, 105, 106, 107, 108, 109, 110, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 165, 166, 167, 169, 236, 237, 238, 239, 240, 274, 306, 307, 308, 309, 339, 373, 374, 375, 376, 378, 379, 380, 381, 382, 384, 385, 386, 387, 388, 390, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 438, 439, 440, 441, 471, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 486, 487, 504, 505, 506, 507, 508); offset {offset}; limit 500;"
            # Send API request

        requestResponse = requests.post(apiUrl, data=body, headers=headers)
        # Extract JSON response
        jsonResponse = requestResponse.json()

        # If response is empty, break loop
        if not jsonResponse:
            break

        # Extend list instead of appending entire JSON
        responseList.extend(jsonResponse)

        # Log progress
        logging.info(f"Retrieved {len(jsonResponse)} games, total: {len(responseList)}")

        # Increment offset
        offset += 500

# Return or process the full list
    print(f"Total games retrieved: {len(responseList)}")