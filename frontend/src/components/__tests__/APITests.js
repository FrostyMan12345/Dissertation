import request from 'request'
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
    var jsonResponse = JSON.parse(body)
    console.log(jsonResponse)
    const access = jsonResponse.access_token
    // try {
    //   infoOptions = {
    //     url: 'https://api.igdb.com/v4/games',
    //     headers: {
    //       'Client-ID': 'c9amzjhdtblmmr4yl5rxd2obhs085u', // Client-ID as a header
    //       Authorization: `Bearer ${access}`, // App Access Token
    //     },
    //     body: 'fields id,platforms,name,age_ratings,cover,first_release_date,genres,storyline,involved_companies; where category=0; search "Hollow Knight";', // Query for IGDB API
    //   }
    //   request.post(infoOptions, (error, response, body) => {
    //     if (error) {
    //       console.error('Error:', error)
    //       return
    //     }

    //     try {
    //       const jsonResponse = JSON.parse(body)
    //       console.log(jsonResponse)
    //     } catch (err) {
    //       console.error('Failed to parse response:', err)
    //     }
    //   })
    try {
      infoOptions = {
        url: 'https://api.igdb.com/v4/platforms',
        headers: {
          'Client-ID': 'c9amzjhdtblmmr4yl5rxd2obhs085u', // Client-ID as a header
          Authorization: `Bearer ${access}`, // App Access Token
        },
        body: 'fields id,name,category; where category = (1,2,5,6);', // Query for IGDB API
      }
      request.post(infoOptions, (error, response, body) => {
        if (error) {
          console.error('Error:', error)
          return
        }

        try {
          const jsonResponse = JSON.parse(body)
          console.log(jsonResponse)
        } catch (err) {
          console.error('Failed to parse response:', err)
        }
      })
    } catch {
      console.error('Failed Game search', err)
    }
  } catch (err) {
    console.error('Failed to parse response:', err)
  }
})
