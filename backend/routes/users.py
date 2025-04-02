from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User, ApiKey

users_bp = Blueprint('users', __name__)

@users_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user.preferences), 200

@users_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.json
    if not data:
        return jsonify({"error": "No preference data provided"}), 400
        
    try:
        user.update_preferences(data)
        db.session.commit()
        return jsonify({
            "message": "Preferences updated successfully",
            "preferences": user.preferences
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@users_bp.route('/api-keys', methods=['GET'])
@jwt_required()
def get_api_keys():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    api_keys = ApiKey.query.filter_by(user_id=user.id).all()
    return jsonify([key.to_dict() for key in api_keys]), 200

@users_bp.route('/api-keys', methods=['POST'])
@jwt_required()
def create_api_key():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    data = request.json or {}
    name = data.get('name')
    expiry_days = data.get('expiry_days', 365)
    
    try:
        api_key = ApiKey.create_for_user(user.id, name, expiry_days)
        db.session.add(api_key)
        db.session.commit()
        
        return jsonify({
            "message": "API key created successfully",
            "api_key": api_key.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@users_bp.route('/api-keys/<int:key_id>', methods=['DELETE'])
@jwt_required()
def delete_api_key(key_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    api_key = ApiKey.query.filter_by(id=key_id, user_id=user.id).first()
    
    if not api_key:
        return jsonify({"error": "API key not found"}), 404
        
    try:
        db.session.delete(api_key)
        db.session.commit()
        
        return jsonify({
            "message": "API key deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500 