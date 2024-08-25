# Education Management System

This project is a multi-container application that uses Docker Compose to manage the different components of the system, including the server, admin, and user services.

## Prerequisites

Ensure you have Docker and Docker Compose installed on your system.

## Running with Docker Compose

To run the application using Docker Compose, follow the steps below:

### Step 1: Build Docker Images

You need to build the Docker images for each service. Navigate to each of the following directories and build the Docker images:

- `./server`
- `./admin`
- `./user`

For each directory, run the following command:

```bash
docker build -t ergys2000/edu-manage-{folder-name} .
```

Replace {folder-name} with the appropriate folder name (server, admin, or user).

### Step 2: Update Docker Compose File
Make sure that the docker-compose.yml file correctly references the builds you created. 
For example:
```yaml
services:
  server:
    image: ergys2000/edu-manage-server
    ...
  admin:
    image: ergys2000/edu-manage-admin
    ...
  user:
    image: ergys2000/edu-manage-user
    ...
```

### Step 3: Start the Application
Initially, the server container might throw errors because the database hasn't been set up yet. To fix this:
1. Create a new database named education.
2. Run the SQL script located at ./server/database.sql to create the necessary tables in the database.
```bash
mysql -u root -p test < /path/to/database.sql
```

### Step 4: Restart Docker Compose
```bash
docker-compose down
docker-compose up
```

### Troubleshooting
If you encounter any issues, make sure to check the following:

* All Docker images are built correctly and referenced properly in the docker-compose.yml file.
* The database is set up correctly with the required tables.