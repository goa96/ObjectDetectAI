import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_babel import Babel
from flask_migrate import Migrate

from models import db
from routes.api import api_bp
from routes.auth import auth_bp
from routes.detection import detection_bp
from routes.users import users_bp

# 加载环境变量
load_dotenv()

def create_app():
    # 初始化 Flask 应用
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt_dev_key')
    app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # 10MB
    app.config['MODEL_FOLDER'] = os.environ.get('MODEL_FOLDER', 'models')
    app.config['DEFAULT_MODEL'] = os.environ.get('DEFAULT_MODEL', 'yolov8s')
    app.config['DEFAULT_CONFIDENCE'] = float(os.environ.get('DEFAULT_CONFIDENCE', 0.25))
    app.config['BABEL_DEFAULT_LOCALE'] = 'en'
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'
    
    # 创建上传文件夹
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['MODEL_FOLDER'], exist_ok=True)
    
    # 初始化扩展
    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)
    babel = Babel(app)
    migrate = Migrate(app, db)
    
    # 注册蓝图
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(detection_bp, url_prefix='/api/detection')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    @babel.localeselector
    def get_locale():
        from flask import request
        return request.accept_languages.best_match(['en', 'zh', 'es', 'fr', 'de', 'ja'])
    
    @app.route('/')
    def index():
        return {'message': 'ObjectDetectAI API is running'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True) 