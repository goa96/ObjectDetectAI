# ObjectDetectAI - Project Structure

## Frontend (Vue.js)
```
frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   └── tailwind.css
│   │   ├── images/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.vue
│   │   │   ├── Footer.vue
│   │   │   └── LanguageSelector.vue
│   │   ├── detection/
│   │   │   ├── ImageUploader.vue
│   │   │   ├── ModelSelector.vue
│   │   │   ├── DetectionOptions.vue
│   │   │   ├── ImagePreview.vue
│   │   │   └── ResultsTable.vue
│   │   └── user/
│   │       ├── LoginForm.vue
│   │       ├── RegisterForm.vue
│   │       └── UserProfile.vue
│   ├── views/
│   │   ├── HomePage.vue
│   │   ├── DetectionPage.vue
│   │   ├── ResultsPage.vue
│   │   ├── HistoryPage.vue
│   │   ├── LoginPage.vue
│   │   ├── RegisterPage.vue
│   │   └── UserProfilePage.vue
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   ├── index.js
│   │   └── modules/
│   │       ├── detection.js
│   │       ├── user.js
│   │       └── settings.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── detection.js
│   ├── locales/
│   │   ├── en.json
│   │   ├── zh.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   ├── de.json
│   │   └── ja.json
│   ├── utils/
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── App.vue
│   └── main.js
├── .env
├── .env.production
├── package.json
├── babel.config.js
├── vue.config.js
└── tailwind.config.js
```

## Backend (Python Flask)
```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── detection_record.py
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── detection_controller.py
│   │   └── user_controller.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── detection_service.py
│   │   ├── user_service.py
│   │   └── file_service.py
│   ├── yolo/
│   │   ├── __init__.py
│   │   ├── detector.py
│   │   ├── models/
│   │   │   ├── yolov8n.pt
│   │   │   ├── yolov8s.pt
│   │   │   └── yolov8m.pt
│   │   └── utils/
│   │       ├── preprocess.py
│   │       └── postprocess.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   ├── security.py
│   │   └── response.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── detection_routes.py
│   │   └── user_routes.py
│   └── database/
│       ├── __init__.py
│       └── db.py
├── migrations/
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_detection.py
│   └── test_user.py
├── instance/
├── uploads/
│   └── images/
├── .env
├── .env.example
├── requirements.txt
└── run.py
```

## Database Schema (MySQL)
```sql
-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(10) DEFAULT 'en'
);

-- Detection Records Table
CREATE TABLE detection_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_path VARCHAR(255) NOT NULL,
    result_path VARCHAR(255) NOT NULL,
    model_used VARCHAR(50) NOT NULL,
    detection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time FLOAT,
    confidence_threshold FLOAT DEFAULT 0.5,
    preprocessing_mode VARCHAR(50) DEFAULT 'none',
    num_objects_detected INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Detection Objects Table (for detailed detection results)
CREATE TABLE detection_objects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    x_min INT NOT NULL,
    y_min INT NOT NULL,
    x_max INT NOT NULL,
    y_max INT NOT NULL,
    FOREIGN KEY (record_id) REFERENCES detection_records(id) ON DELETE CASCADE
);

-- User Settings Table
CREATE TABLE user_settings (
    user_id INT PRIMARY KEY,
    default_model VARCHAR(50) DEFAULT 'yolov8n',
    default_confidence FLOAT DEFAULT 0.5,
    default_preprocessing VARCHAR(50) DEFAULT 'none',
    save_history BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API Tokens Table (for external API access)
CREATE TABLE api_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
``` 