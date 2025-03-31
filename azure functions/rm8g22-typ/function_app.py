import azure.functions as func
import datetime
import json
import logging
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from itertools import islice

from dataFunctions import *

app = func.FunctionApp()

client = MongoClient('mongodb+srv://rm8g22:YVFDtnZZT7k7m2aH@rm8g22-project-database.xkyqq.mongodb.net/Third_Year_Project?retryWrites=true&w=majority&connectTimeoutMS=600000&maxPoolSize=50&socketTimeoutMS=600000&appName=rm8g22-project-database')
db = client["Third_Year_Project"] 
gameCollection = db["Games"] 

# Load environment variables from the .env file located one directory up
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
os.environ['TWITCH_ACCESS'] = refreshAccess()



@app.timer_trigger(schedule="0 0 0 * * *", arg_name="myTimer", run_on_startup=False, use_monitor=False)
def update_Database(myTimer: func.TimerRequest) -> None:
    logging.info(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    if myTimer.past_due:
        logging.info('The timer is past due!')
    
    logging.info('Python timer trigger function executed.')
    try:
        os.environ['TWITCH_ACCESS'] = refreshAccess()
        newEntries = updateDatabase()
        gameCollection.insert_many(newEntries)
    except Exception as e:
        return func.HttpResponse(body=json.dumps({"msg": f"Failed to update database: {e}"}),mimetype="application/json")
    return func.HttpResponse(body=json.dumps({"msg": f"Database updated with {len(newEntries)} items"}),mimetype="application/json")



@app.route(route="credentials/get", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def get_credentials(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Get credentials triggered')
    access = os.getenv('TWITCH_ACCESS')
    return func.HttpResponse(body=json.dumps({"ACCESS": access}),mimetype="application/json")



@app.route(route="credentials/refresh", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def refresh_credentials(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Refresh credentials triggered')
    os.environ['TWITCH_ACCESS'] = refreshAccess()
    access = os.getenv('TWITCH_ACCESS')
    return func.HttpResponse(body=json.dumps({"ACCESS": access}),mimetype="application/json")



@app.route(route="count", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def get_count(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(body=json.dumps({"count": getNumberOfGames()}),mimetype="application/json")

@app.route(route="db/count", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.FUNCTION)
def get_count_db(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(body=json.dumps({"count": gameCollection.count_documents({})}),mimetype="application/json")

@app.route(route="db/setup", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.ADMIN)
def get_new_db(req: func.HttpRequest) -> func.HttpResponse:
    gameCollection.delete_many({})
    try:
        db = getCompleteDatabase()
        it = iter(db)  
        slices = [list(islice(it, 30000)) for _ in range((len(db) + 30000 - 1) // 30000)]
        for slice in slices:
            gameCollection.insert_many(slice) # instering entire list at once does not work
            logging.info("30000 games added")
    except Exception as e:
        logging.exception(f"Error occurred while inserting data: {e}")
        return func.HttpResponse(body=json.dumps({"msg": f"Failed to setup database: {e}"}),mimetype="application/json")
    return func.HttpResponse(body=json.dumps({"msg": f"Database setup with {gameCollection.count_documents({})} items"}),mimetype="application/json")



@app.route(route="image", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.ADMIN)
def get_cover_id(req: func.HttpRequest) -> func.HttpResponse:
    # input = req.get_json()
    coverId = req.params.get('coverId')
    return func.HttpResponse(body=json.dumps({"id": getAssociatedImage(coverId)}))
        