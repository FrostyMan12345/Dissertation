import request from 'request'

var authorizationKey = ''

function getNewAuthorizationKey() {
  var infoOptions = {
    url: 'https://id.twitch.tv/oauth2/token',
    form: {
      client_id: 'c9amzjhdtblmmr4yl5rxd2obhs085u',
      client_secret: 'k20531f7b259ctkeelqvvqk2ldz95a',
      grant_type: 'client_credentials',
    },
  }

  request.post(infoOptions, (error, response, body) => {
    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('Raw response body:', body)

    try {
      const jsonResponse = JSON.parse(body)
      authorizationKey = body.access_token
    } catch {
      console.error(error)
    }
  })
}
