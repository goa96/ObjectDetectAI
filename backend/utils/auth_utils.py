import re
from functools import wraps
from flask import request, jsonify, current_app, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from models import db, ApiKey, User

def validate_email(email):
    """验证电子邮件格式是否正确"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def validate_password(password):
    """验证密码是否符合要求
    至少8个字符，包含字母和数字
    """
    if len(password) < 8:
        return False
    if not any(c.isalpha() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    return True

def get_user_by_api_key(api_key):
    """通过API密钥获取用户"""
    if not api_key:
        return None
        
    key_obj = ApiKey.query.filter_by(key=api_key, active=True).first()
    
    if not key_obj or not key_obj.is_valid():
        return None
        
    # 更新最后使用时间
    key_obj.use()
    db.session.commit()
    
    return User.query.get(key_obj.user_id)

def api_key_required(f):
    """API密钥验证装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 检查是否已经通过JWT认证
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            g.current_user = User.query.get(user_id)
            return f(*args, **kwargs)
        except:
            # 如果JWT认证失败，尝试API密钥
            pass
            
        # 从请求头或查询参数获取API密钥
        api_key = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            api_key = auth_header.split('Bearer ')[1]
        else:
            api_key = request.args.get('api_key')
            
        if not api_key:
            return jsonify({"error": "Missing API key"}), 401
            
        user = get_user_by_api_key(api_key)
        
        if not user:
            return jsonify({"error": "Invalid or expired API key"}), 401
            
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function 