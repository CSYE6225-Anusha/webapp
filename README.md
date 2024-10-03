# Health Check and User API

## What it does 🤖
- Monitors application health, preventing traffic to unhealthy instances, and bootstraps the database automatically at startup.
- Enforces Token-Based Basic Authentication for secure API access.
  
## Features 🚀
- **Database Bootstrapping**:  Automatically creates or updates the database schema using Sequelize ORM.
- **Health Checks**: Ensures database connectivity with failure returning  `503 Service Unavailable`.
- **Cache Control**: Adds `Cache-Control` headers to prevent caching of the health check responses.
- **Creating User**: A user can be created using the post call and various validations are enforced as well as the password is encrypted before storing in the database.
- **Authenticated Routes**: The get and put call for the user are authenticated routes and it is provided by the use of Token-Based Basic authentication.
- **Method Restriction**: All other requests return `405 Method Not Allowed`.
- **Code Quality**: Code quality to be maintained to the highest standards using integration tests.

## How to Use ⚙

- [x] Clone the repository to your local directory
- `git clone git@github.com:CSYE6225-Anusha/webapp.git`

- [x] Install the dependencies
- `npm install` 
  
- [x] Create a .env file and specify the following environment variables
- `PORT=<your_port>` \
  `DB_NAME=<your_database_name>` \
  `DB_USERNAME=<your_database_username>` \
  `DB_PASSWORD=<your_database_password>` \
  `TEST_DB_NAME=<your_testdatabase_name>` \
  `TEST_DB_USERNAME=<your_testdatabase_username>` \
  `TEST_DB_PASSWORD=<your_testdatabase_password>` \
  `host=<your_database_host>` \
  `dialect=<your_database_dialect>` 

- [x] Start the server
- `npm start`

- [x] Test the application
- `npm test`
  
## Support the Project with a ⭐ 
```javascript
if (youEnjoyed) {
    starThisRepository();
}




