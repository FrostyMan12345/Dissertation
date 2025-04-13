import azure.functions as func
import datetime
import json
import logging
import os
from dotenv import load_dotenv
from pymongo import MongoClient, IndexModel, ASCENDING, DESCENDING
from itertools import islice

from dataFunctions import *

app = func.FunctionApp()

client = MongoClient('mongodb+srv://rm8g22:YVFDtnZZT7k7m2aH@rm8g22-project-database.xkyqq.mongodb.net/Third_Year_Project?retryWrites=true&w=majority&connectTimeoutMS=600000&maxPoolSize=50&socketTimeoutMS=600000&appName=rm8g22-project-database')
db = client["Third_Year_Project"] 
gameCollection = db["Games"] 
companiesCollection = db["Companies"]

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
        newEntries = updateGameDatabase()
        gameCollection.insert_many(newEntries)
        logging.info(f"{len(newEntries)} added to database")
    except Exception as e:
        logging.info(e)



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

@app.route(route="db/game/setup", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.ADMIN)
def get_new_game_db(req: func.HttpRequest) -> func.HttpResponse:
    gameCollection.delete_many({})
    try:
        db = getCompleteGameDatabase()
        it = iter(db)  
        slices = [list(islice(it, 30000)) for _ in range((len(db) + 30000 - 1) // 30000)]
        for slice in slices:
            gameCollection.insert_many(slice) 
            logging.info("30000 games added")
    except Exception as e:
        logging.exception(f"Error occurred while inserting data: {e}")
        return func.HttpResponse(body=json.dumps({"msg": f"Failed to setup games database: {e}"}),mimetype="application/json")
    return func.HttpResponse(body=json.dumps({"msg": f"Database setup with {gameCollection.count_documents({})} items"}),mimetype="application/json")

@app.route(route="db/comapnies/setup", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.ADMIN)
def get_new_comapnies_db(req: func.HttpRequest) -> func.HttpResponse:
    companiesCollection.delete_many({})
    try:
        db = getCompleteCompaniesDatabase()
        it = iter(db)  
        slices = [list(islice(it, 30000)) for _ in range((len(db) + 30000 - 1) // 30000)]
        for slice in slices:
            companiesCollection.insert_many(slice) 
            logging.info("30000 companies added")
    except Exception as e:
        logging.exception(f"Error occurred while inserting data: {e}")
        return func.HttpResponse(body=json.dumps({"msg": f"Failed to setup companies database: {e}"}),mimetype="application/json")
    return func.HttpResponse(body=json.dumps({"msg": f"Database setup with {companiesCollection.count_documents({})} items"}),mimetype="application/json")



@app.route(route="image", methods=[func.HttpMethod.GET],auth_level=func.AuthLevel.ADMIN)
def get_cover_id(req: func.HttpRequest) -> func.HttpResponse:
    # input = req.get_json()
    coverId = req.params.get('coverId')
    return func.HttpResponse(body=json.dumps({"id": getAssociatedImage(coverId)}))
        