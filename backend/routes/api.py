from flask import Blueprint, request, jsonify, current_app
from flask_babel import gettext as _

api_bp = Blueprint('api', __name__)

@api_bp.route('/info', methods=['GET'])
def get_api_info():
    """获取API信息"""
    info = {
        "name": "ObjectDetectAI API",
        "version": "1.0.0",
        "description": "API for object detection using YOLOv8",
        "endpoints": {
            "auth": {
                "register": "/api/auth/register",
                "login": "/api/auth/login",
                "me": "/api/auth/me"
            },
            "detection": {
                "models": "/api/detection/models",
                "detect": "/api/detection/detect",
                "history": "/api/detection/history"
            },
            "users": {
                "preferences": "/api/users/preferences",
                "api_keys": "/api/users/api-keys"
            }
        }
    }
    return jsonify(info), 200

@api_bp.route('/languages', methods=['GET'])
def get_languages():
    """获取支持的语言列表"""
    languages = [
        {"code": "en", "name": "English", "native_name": "English"},
        {"code": "zh", "name": "Chinese", "native_name": "中文"},
        {"code": "es", "name": "Spanish", "native_name": "Español"},
        {"code": "fr", "name": "French", "native_name": "Français"},
        {"code": "de", "name": "German", "native_name": "Deutsch"},
        {"code": "ja", "name": "Japanese", "native_name": "日本語"}
    ]
    return jsonify(languages), 200

@api_bp.route('/translations/<lang>', methods=['GET'])
def get_translations(lang):
    """获取特定语言的翻译文本"""
    # 这里可以实现从语言文件加载翻译
    # 简化示例
    translations = {
        "app_name": _("ObjectDetectAI"),
        "home": _("Home"),
        "detection": _("Detection"),
        "history": _("History"),
        "settings": _("Settings"),
        "login": _("Login"),
        "register": _("Register"),
        "logout": _("Logout"),
        "profile": _("Profile")
    }
    return jsonify(translations), 200

@api_bp.route('/health', methods=['GET'])
def health_check():
    """API健康检查"""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0"
    }), 200 