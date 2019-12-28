export const environment = {
  production: false,
  appName: "Mi Cocina - Dev/Stage",
  appVersion: "1.0.3",
  appURL: "http://localhost:8080",
  apiURL: "http://localhost:3000/api/",
  apiManagementEndpoint: "management/",
  apiMediaEndpoint: "media/",
  authSettings: {
    clientID: 'IbLockBJXrOl9ozFMrqWTr0rH0IAlobF', //Stage
    domain: 'elmosoftware-stage.auth0.com',
    audience: 'https://elmosoftware-stage.auth0.com/api/v2/', 
    dbConnection: "Username-Password-Authentication",
    responseType: 'token id_token',
    redirectURI: 'http://localhost:8080/auth-callback',
    scope: 'openid profile email update:users update:current_user_metadata' //Standard Open ID Claims so calls 
    //to \userinfo endpoint can return user data. Also this allows us to update users data like, metadata, change email, etc.
  },
  appSettings: {
    contactEmail: "juancarlosgarcia_arg@hotmail.com",
    maxPicturesPerRecipe: 5
  },
  logging: {
    dsn: "https://a4ceb0478d5b47ad941bd909b9cb5451@sentry.io/1515105",
    source: "Mi Cocina - Web",
    environment: 'staging'
  },
  connectivityCheck: {
    apiManagementFunction: "config-status/", 
    apiMethod: "GET",
    wwwURL: "http://res.cloudinary.com/elmosoftware/image/upload/sample.jpg",
    wwwMethod: "HEAD"
  } 
};
