import azure.functions as func
import datetime
import json
import logging
import os
from dotenv import load_dotenv
from pymongo import MongoClient

from dataFunctions import *

app = func.FunctionApp()

client = MongoClient('mongodb+srv://rm8g22:YVFDtnZZT7k7m2aH@rm8g22-project-database.xkyqq.mongodb.net/Third_Year_Project?retryWrites=true&w=majority&appName=rm8g22-project-database')
db = client["Third_Year_Project"] 
gameCollection = db["Games"] 

# Load environment variables from the .env file located one directory up
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
os.environ['TWITCH_ACCESS'] = refreshAccess()

@app.timer_trigger(schedule="0 0 * * * *", arg_name="myTimer", run_on_startup=False, use_monitor=False)
def update_Database(myTimer: func.TimerRequest) -> None:
    logging.info(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    if myTimer.past_due:
        logging.info('The timer is past due!')
    
    logging.info('Python timer trigger function executed.')
    try:
        newEntries = getCompleteDatabase()
        gameCollection.insert_many(newEntries)
    except Exception as e:
        return func.HttpResponse(body=json.dumps({"msg": f"Failed to update database: {e}"}),mimetype="application/json")
    return func.HttpResponse(body=json.dumps({"msg": f"Database upodated with {newEntries.count()} items"}),mimetype="application/json")


@app.route(route="credentials", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def get_new_credentials(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Get credentials triggered')
    access = os.getenv('TWITCH_ACCESS')
    return func.HttpResponse(body=json.dumps({"ACCESS": access}),mimetype="application/json")

@app.route(route="count", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def get_count(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(body=json.dumps({"count": getNumberOfGames()}),mimetype="application/json")

@app.route(route="countdb", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def get_count_db(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(body=json.dumps({"count": gameCollection.count_documents({})}),mimetype="application/json")

@app.route(route="setupdb", methods=[func.HttpMethod.POST],auth_level=func.AuthLevel.ADMIN)
def get_new_db(req: func.HttpRequest) -> func.HttpResponse:
    gameCollection.delete_many({})
    try:
        gameCollection.insert_many(getCompleteDatabase())
    except Exception as e:
        return func.HttpResponse(body=json.dumps({"msg": f"Failed to setup database: {e}"}),mimetype="application/json")
    return func.HttpResponse(body=json.dumps({"msg": f"Database setup with {gameCollection.count_documents({})} items"}),mimetype="application/json")