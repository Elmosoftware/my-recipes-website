export const environment = {
  production: true,
  appName: "Mi Cocina",
  appVersion: "1.0.2",
  appURL: "https://micocina.herokuapp.com",
  apiURL: "https://micocina-api.herokuapp.com/api/",
  apiManagementEndpoint: "management/",
  apiMediaEndpoint: "media/",
  authSettings: {
    clientID: 'z2pX8Q7bn1ceLi03OpG11ACfQ2g0xZ2o', //Prod
    domain: 'elmosoftware.auth0.com',
    audience: 'https://elmosoftware.auth0.com/api/v2/', 
    dbConnection: "Username-Password-Authentication",
    responseType: 'token id_token',
    redirectURI: 'https://micocina.herokuapp.com/auth-callback',
    scope: 'openid profile email update:users update:current_user_metadata' //Standard Open ID Claims so calls 
    //to \userinfo endpoint can return user data. Also this allows us to update users data like, metadata, change email, etc.
  },
  appSettings: {
    contactEmail: "juancarlosgarcia_arg@hotmail.com",
    maxPicturesPerRecipe: 5
  },
  logging: {
    dsn: "https://e48585636b8b47e9851a756c9b327a73@sentry.io/1515102",
    source: "Mi Cocina - Web",
    environment: 'production'
  },
  connectivityCheck: {
    apiManagementFunction: "config-status/", 
    apiMethod: "GET",
    wwwURL: "https://res.cloudinary.com/elmosoftware/image/upload/sample.jpg",
    wwwMethod: "HEAD"
  } 
};