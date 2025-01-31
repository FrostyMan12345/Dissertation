const request = require('request')
const response = request.post(
  'https://id.twitch.tv/oauth2/token?client_id=c9amzjhdtblmmr4yl5rxd2obhs085u&client_secret=k20531f7b259ctkeelqvvqk2ldz95a&grant_type=client_credentials',
)
console.log(response.json())
