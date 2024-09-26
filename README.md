# Health Check API

## What it does 🤖
- The health check API allows us to monitor the health of the application instance and alert us when something is not working as expected.
- The health check API prevents us from sending traffic to unhealthy application instances and automatically replace/repair them. It also helps us improve user experience by not routing their quests to unhealthy instances.
  
## Features 🚀
- **Database Connectivity Check**: Authenticates with the PostgreSQL database. If the connection fails, returns a `503 Service Unavailable` status.
- **Request Validation**: Ensures that no request body or query parameters are passed. If any are detected, a `400 Bad Request` status is returned.
- **Cache Control**: Adds `Cache-Control` headers to prevent caching of the health check responses.
- **Method Restriction**: Accepts only `GET` requests for health checks. Other methods return a `405 Method Not Allowed` response.

## How It Works 💡

### Environment Setup

- Uses the `dotenv` package to load environment variables for secure database configuration.

### Database Connectivity

- Uses Sequelize ORM to connect to PostgreSQL.

### Request Validation

- Verifies that no content body or query parameters are passed in the `GET` request. If content is detected, it returns a `400 Bad Request`.

### Error Handling

- If database authentication fails, it returns a `503 Service Unavailable` response.

### Method Restriction

- Handles `GET` requests for health checks. For any other HTTP methods, it responds with a `405 Method Not Allowed` .

## How to Use ⚙

- [x] Clone the repository to your local directory
- `git clone git@github.com:CSYE6225-Anusha/webapp.git`

- [x] Install the dependencies
- `npm install` 
  
- [x] Create a .env file and specify the following environment variables
- `DB_NAME=<your_database_name>` \
  `DB_USERNAME=<your_database_username>` \
  `DB_PASSWORD=<your_database_password>`

- [x] Start the server
- `node index.js`
  
## Support the Project with a ⭐ 
```javascript
if (youEnjoyed) {
    starThisRepository();
}




