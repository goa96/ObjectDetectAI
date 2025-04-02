from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

from models import db, User
from utils.auth_utils import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # 验证请求数据
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing required fields"}), 400
        
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    # 验证邮箱
    if not validate_email(email):
        return jsonify({"error": "Invalid email format"}), 400
        
    # 验证密码
    if not validate_password(password):
        return jsonify({"error": "Password must be at least 8 characters and contain both letters and numbers"}), 400
        
    # 检查用户是否已存在
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        if existing_user.username == username:
            return jsonify({"error": "Username already exists"}), 409
        else:
            return jsonify({"error": "Email already exists"}), 409
            
    # 创建新用户
    try:
        user = User(
            username=username,
            email=email
        )
        user.password = password  # 这里会自动哈希密码
        
        # 设置默认偏好
        user.preferences = {
            "defaultModel": "yolov8s",
            "saveHistory": True,
            "language": request.accept_languages.best_match(['en', 'zh', 'es', 'fr', 'de', 'ja']) or 'en',
            "darkMode": False
        }
        
        db.session.add(user)
        db.session.commit()
        
        # 创建访问令牌
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # 验证请求数据
    if not data or (not data.get('username') and not data.get('email')) or not data.get('password'):
        return jsonify({"error": "Missing required fields"}), 400
        
    # 允许用户通过用户名或邮箱登录
    identifier = data.get('username') or data.get('email')
    password = data.get('password')
    
    # 查找用户
    user = None
    if '@' in identifier:
        user = User.query.filter_by(email=identifier).first()
    else:
        user = User.query.filter_by(username=identifier).first()
        
    # 验证用户和密码
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
        
    if not user.active:
        return jsonify({"error": "Account is disabled"}), 403
        
    # 创建访问令牌
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user.to_dict()), 200

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.json
    
    # 更新用户名
    if 'username' in data:
        new_username = data['username']
        existing = User.query.filter_by(username=new_username).first()
        if existing and existing.id != user.id:
            return jsonify({"error": "Username already exists"}), 409
        user.username = new_username
    
    # 更新电子邮件
    if 'email' in data:
        new_email = data['email']
        if not validate_email(new_email):
            return jsonify({"error": "Invalid email format"}), 400
            
        existing = User.query.filter_by(email=new_email).first()
        if existing and existing.id != user.id:
            return jsonify({"error": "Email already exists"}), 409
        user.email = new_email
    
    # 更新密码
    if 'password' in data and 'current_password' in data:
        if not user.check_password(data['current_password']):
            return jsonify({"error": "Current password is incorrect"}), 401
            
        new_password = data['password']
        if not validate_password(new_password):
            return jsonify({"error": "Password must be at least 8 characters and contain both letters and numbers"}), 400
            
        user.password = new_password
    
    # 更新偏好
    if 'preferences' in data:
        user.update_preferences(data['preferences'])
    
    try:
        db.session.commit()
        return jsonify({
            "message": "User updated successfully",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500 