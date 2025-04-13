import os
import requests
import logging
import time
from dotenv import load_dotenv
import concurrent.futures
import sys
logging.basicConfig(stream=sys.stdout, level=logging.INFO, force=True)

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] [%(threadName)s] %(message)s",
    level=logging.INFO
)

def getNumberOfGames():
    url = "https://api.igdb.com/v4/games/count"
    headers = {
    "Client-ID": os.getenv("CLIENT_ID"),
    "Authorization": f"Bearer {os.getenv('TWITCH_ACCESS')}"
    }
    currentTime = int(time.time())
    body = f"fields id, age_ratings, first_release_date, genres.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, name, platforms.name, summary, storyline, expanded_games.name, ports.name, cover.image_id, keywords.name, themes.name; where first_release_date < {currentTime} & game_type = 0 & category != (5, 2) & platforms = (3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 32, 33, 35, 37, 38, 41, 42, 44, 46, 48, 49, 50, 51, 52, 53, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 75, 77, 78, 79, 80, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 99, 101, 102, 104, 105, 106, 107, 108, 109, 110, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 165, 166, 167, 169, 236, 237, 238, 239, 240, 274, 306, 307, 308, 309, 339, 373, 374, 375, 376, 378, 379, 380, 381, 382, 384, 385, 386, 387, 388, 390, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 438, 439, 440, 441, 471, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 486, 487, 504, 505, 506, 507, 508) & version_title = null & version_parent = null & themes != (42);"

    
    response = requests.post(url, data=body, headers=headers)
    print(response.json())  
    return response.json()["count"]

def getNumberOfCompanies():
    url = "https://api.igdb.com/v4/companies/count"
    headers = {
    "Client-ID": os.getenv("CLIENT_ID"),
    "Authorization": f"Bearer {os.getenv('TWITCH_ACCESS')}"
    }    
    response = requests.post(url, data="", headers=headers)
    print(response.json()) 
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

# def test_worker(offset):
#     logging.info(f"Thread started for offset {offset}")
#     time.sleep(1)  # Simulate work
#     return offset

# def debug_threads():
#     offsets = list(range(0, 5000, 500))
#     logging.info("Starting ThreadPoolExecutor")
    
#     with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
#         results = list(executor.map(test_worker, offsets))
    
#     logging.info("All threads completed")

def getCompleteGameDatabase():
    offsets = list(range(0, getNumberOfGames()+500, 500)) 
    responseList = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:  
        logging.info("Starting API calls with ThreadPoolExecutor")
        results = list(executor.map(gameRequest, offsets))
        logging.info("Stopped executing workers")
    logging.info("API calls finsihed")
    for result in results:
        if result is None:
            logging.warning("Received None instead of a list!")
        else:
            responseList.extend(result)
    return responseList

def getCompleteCompaniesDatabase():
    offsets = list(range(0, getNumberOfCompanies()+500, 500)) 
    responseList = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:  
        logging.info("Starting API calls with ThreadPoolExecutor")
        results = list(executor.map(companyRequest, offsets))
        logging.info("Stopped executing workers")
    logging.info("API calls finsihed")
    for result in results:
        if result is None:
            logging.warning("Received None instead of a list!")
        else:
            responseList.extend(result)
    return responseList

def gameRequest(offset):
    try: 
        access = os.getenv('TWITCH_ACCESS')
        apiUrl = 'https://api.igdb.com/v4/games'
        headers = {
            'Client-ID': 'c9amzjhdtblmmr4yl5rxd2obhs085u',
            'Authorization': f"bearer {access}",
        }
        currentTime = int(time.time())
        body = f"fields id, age_ratings, first_release_date, genres.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, name, platforms.name, summary, storyline, expanded_games.name, ports.name, cover.image_id, keywords.name, themes.name; where first_release_date < {currentTime} & category = 0 & category != (5, 2) & platforms = (3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 32, 33, 35, 37, 38, 41, 42, 44, 46, 48, 49, 50, 51, 52, 53, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 75, 77, 78, 79, 80, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 99, 101, 102, 104, 105, 106, 107, 108, 109, 110, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 165, 166, 167, 169, 236, 237, 238, 239, 240, 274, 306, 307, 308, 309, 339, 373, 374, 375, 376, 378, 379, 380, 381, 382, 384, 385, 386, 387, 388, 390, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 438, 439, 440, 441, 471, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 486, 487, 504, 505, 506, 507, 508) & version_title = null & version_parent = null & themes != (42); offset {offset}; limit 500;"
        requestResponse = requests.post(apiUrl, data=body, headers=headers)
        logging.info(f"{len(requestResponse.json())}, offset: {offset}")
        if requestResponse.status_code == 200:
            return requestResponse.json()
        else:
            logging.error(f"Error at offset {offset}: {requestResponse.status_code}")
            return []
    except Exception as e: 
        logging.error(f"Exception in gameRequest at offset {offset}: {str(e)}")
        return []  
    
def companyRequest(offset):
    try: 
        access = os.getenv('TWITCH_ACCESS')
        apiUrl = 'https://api.igdb.com/v4/companies'
        headers = {
            'Client-ID': 'c9amzjhdtblmmr4yl5rxd2obhs085u',
            'Authorization': f"bearer {access}",
        }
        body = f"fields id, name; offset {offset}; limit 500;"
        requestResponse = requests.post(apiUrl, data=body, headers=headers)
        logging.info(f"{len(requestResponse.json())}, offset: {offset}")
        if requestResponse.status_code == 200:
            return requestResponse.json()
        else:
            logging.error(f"Error at offset {offset}: {requestResponse.status_code}")
            return []
    except Exception as e: 
        logging.error(f"Exception in companyRequest at offset {offset}: {str(e)}")
        return []  
 

def updateGameDatabase():
    access = os.getenv('TWITCH_ACCESS')
    apiUrl = 'https://api.igdb.com/v4/games'
    offset = 0
    headers = {
        'Client-ID': 'c9amzjhdtblmmr4yl5rxd2obhs085u',
        'Authorization': f"bearer {access}",
    }
    responseList = []
    currentTime = int(time.time())
    yesterdayTime = currentTime - 86400  
    while True:
        body = f"fields id, age_ratings, first_release_date, genres.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, name, platforms.name, summary, storyline, expanded_games.name, ports.name, cover.image_id, keywords.name, themes.name, category; where first_release_date < {currentTime} & first_release_date > {yesterdayTime} & category = 0 & category !=  (5, 2)  & platforms = (3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 32, 33, 35, 37, 38, 41, 42, 44, 46, 48, 49, 50, 51, 52, 53, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 75, 77, 78, 79, 80, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 99, 101, 102, 104, 105, 106, 107, 108, 109, 110, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 165, 166, 167, 169, 236, 237, 238, 239, 240, 274, 306, 307, 308, 309, 339, 373, 374, 375, 376, 378, 379, 380, 381, 382, 384, 385, 386, 387, 388, 390, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 438, 439, 440, 441, 471, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 486, 487, 504, 505, 506, 507, 508) & version_title = null & version_parent = null & themes != (42); offset {offset}; limit 500;"
        requestResponse = requests.post(apiUrl, data=body, headers=headers)
        jsonResponse = requestResponse.json()
        if not jsonResponse:
            break
        responseList.extend(jsonResponse)
        logging.info(f"Retrieved {len(jsonResponse)} games, total: {len(responseList)}, offset = {offset}")
        offset += 500
    return responseList

def getAssociatedImage(coverId):
    access = os.getenv('TWITCH_ACCESS')
    apiUrl = 'https://api.igdb.com/v4/covers'
    headers = {
        'Client-ID': 'c9amzjhdtblmmr4yl5rxd2obhs085u',
        'Authorization': f"bearer {access}",
    }
    body = f"fields image_id; where id = {coverId};"
    try:
        requestResponse = requests.post(apiUrl, data=body, headers=headers)
        jsonResponse = requestResponse.json()
        logging.info(jsonResponse[0])
        return jsonResponse[0]["image_id"]
    except Exception as e:
        return e
