export class Game {
  constructor(
    _id = null,
    id = null,
    gameTitle = 'Unknown',
    coverId = null,
    description = 'No description available',
    summary = 'No summary available',
    platforms = [],
    genres = [],
    companies = {},
    keywords = [],
    themes = [],
    date = null,
    ageRatings = [],
    ratings = 0,
    timePlayed = 0,
    playedBy = [],
    comments = [],
    imageId = 0,
    ports = [],
    expandedGames = [],
  ) {
    this._id = _id
    this.id = id
    this.gameTitle = gameTitle
    this.coverId = coverId
    this.description = description
    this.summary = summary
    this.platforms = platforms
    this.genres = genres
    this.companies = companies
    this.keywords = keywords
    this.themes = themes
    this.date = date
    this.ageRatings = ageRatings
    this.ratings = ratings
    this.timePlayed = timePlayed
    this.playedBy = playedBy
    this.comments = comments
    this.imageId = imageId
    this.ports = ports
    this.expandedGames = expandedGames
  }
  static gameFromObject(gameObject) {
    console.log(gameObject)
    return new Game(
      gameObject._id,
      gameObject.id,
      gameObject.name,
      gameObject.cover,
      gameObject.storyline,
      gameObject.summary,
      gameObject.platforms,
      gameObject.genres,
      gameObject.involved_companies,
      gameObject.keywords,
      gameObject.themes,
      gameObject.first_release_date,
      gameObject.age_ratings,
      gameObject.ratings,
      gameObject.timePlayed,
      gameObject.played_by,
      gameObject.comments,
      gameObject.imageId,
      gameObject.ports,
      gameObject.expanded_games,
    )
  }
}
