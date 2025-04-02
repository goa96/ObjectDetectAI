# ObjectDetectAI - Multilingual Object Detection System

A multilingual object detection system based on Vue.js, Flask, and YOLOv8 that supports multiple languages and provides an intuitive user experience.

## Features

- Object detection based on YOLOv8
- Multilingual support (English, Chinese)
- Responsive design for mobile and desktop
- User account management and detection history
- Image upload and URL image detection
- Customizable detection parameters
- Dark mode support

## Project Structure

The project is divided into two parts:

- `frontend/`: Vue.js frontend application
- `backend/`: Flask backend application
- `docker-compose.yml`: Docker configuration file

## Quick Start

### Using Docker

1. Ensure Docker and Docker Compose are installed
2. Clone the repository: `git clone https://github.com/yourusername/ObjectDetectAI.git`
3. Navigate to the project directory: `cd ObjectDetectAI`
4. Start the services: `docker-compose up -d`
5. Access the application: `http://localhost:8080`

### Manual Installation

#### Frontend

```bash
cd frontend
npm install
npm run serve
```

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
flask run
```

## API Documentation

API documentation can be accessed at `http://localhost:5000/api/docs` after the backend is running.

## Configuration

### Environment Variables

Frontend environment variables are configured in the `.env` file:

```
VUE_APP_API_URL=http://localhost:5000
```

Backend environment variables are set in the `.env` file or Docker configuration:

```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URI=mysql://username:password@localhost/dbname
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
```

## Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
pytest
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build

# Build the entire application using Docker
docker-compose build
```

## License

[MIT](LICENSE)

## Author

Your Name