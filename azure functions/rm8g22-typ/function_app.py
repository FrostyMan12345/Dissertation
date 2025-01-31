import azure.functions as func
import datetime
import json
import logging
import os
from dotenv import load_dotenv

from dataFunctions import *

app = func.FunctionApp()

# Load environment variables from the .env file located one directory up
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
os.environ['TWITCH_ACCESS'] = refreshAccess()

# @app.timer_trigger(schedule="*/10 * * * * *", arg_name="myTimer", run_on_startup=False, use_monitor=False)
# def getGameDatabase(myTimer: func.TimerRequest) -> None:
#     logging.info(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
#     if myTimer.past_due:
#         logging.info('The timer is past due!')
    
#     logging.info('Python timer trigger function executed.')
#     os.environ['TWITCH_ACCESS'] = refreshAccess()
#     # getNumberOfGames()

@app.route(route="credentials", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def tour_create(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Get credentials triggered')
    access = os.getenv('TWITCH_ACCESS')
    getDatabase()
    return func.HttpResponse(body=json.dumps({"ACCESS": access}),mimetype="application/json")

@app.route(route="count", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def get_count(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(body=json.dumps({"count": getNumberOfGames()}),mimetype="application/json")