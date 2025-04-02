import os
from flask import Blueprint, request, jsonify, current_app, g, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

from models import db, User, Detection
from utils.auth_utils import api_key_required
from utils.image_utils import save_uploaded_file, save_image_from_url, preprocess_image
from utils.detection_utils import detect_objects, get_available_models

detection_bp = Blueprint('detection', __name__)

@detection_bp.route('/models', methods=['GET'])
def get_models():
    """获取可用的检测模型列表"""
    models = get_available_models()
    return jsonify(models), 200

@detection_bp.route('/detect', methods=['POST'])
@api_key_required
def detect():
    """检测图像中的物体"""
    # 获取当前用户
    user = g.current_user
    
    # 从请求中获取参数
    model_name = request.form.get('model', current_app.config['DEFAULT_MODEL'])
    
    try:
        confidence = float(request.form.get('confidence', current_app.config['DEFAULT_CONFIDENCE']))
    except ValueError:
        confidence = current_app.config['DEFAULT_CONFIDENCE']
        
    # 处理预处理选项
    preprocessing = {}
    if request.form.get('preprocessing'):
        try:
            preprocessing = json.loads(request.form.get('preprocessing'))
        except json.JSONDecodeError:
            pass
    
    # 获取图像文件
    image_path = None
    
    if 'image' in request.files:
        # 从文件上传
        file = request.files['image']
        image_path = save_uploaded_file(file, subfolder='images')
    elif request.form.get('image_url'):
        # 从URL加载
        image_url = request.form.get('image_url')
        image_path = save_image_from_url(image_url, subfolder='images')
    
    if not image_path:
        return jsonify({"error": "No valid image provided"}), 400
    
    # 应用预处理
    processed_image = preprocess_image(image_path, preprocessing)
    if processed_image:
        image_to_detect = processed_image
    else:
        image_to_detect = image_path
        
    # 执行检测
    results, processing_time, result_path = detect_objects(
        image_to_detect, 
        model_name=model_name, 
        confidence=confidence
    )
    
    if results is None:
        return jsonify({"error": "Detection failed"}), 500
    
    # 保存检测历史记录
    if user and user.preferences.get('saveHistory', True):
        try:
            detection = Detection(
                user_id=user.id,
                model_name=model_name,
                confidence_threshold=confidence,
                image_path=image_path,
                result_path=result_path,
                processing_time=processing_time,
                preprocessing=preprocessing
            )
            detection.results = results
            
            db.session.add(detection)
            db.session.commit()
            
            detection_id = detection.id
        except Exception as e:
            db.session.rollback()
            print(f"Error saving detection history: {e}")
            detection_id = None
    else:
        detection_id = None
    
    # 构造响应
    response = {
        "success": True,
        "detection_id": detection_id,
        "model": model_name,
        "confidence_threshold": confidence,
        "processing_time": processing_time,
        "objects_detected": len(results),
        "results": results
    }
    
    if result_path:
        response["result_image"] = os.path.basename(result_path)
    
    return jsonify(response), 200

@detection_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """获取用户的检测历史"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # 分页参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 查询历史记录
    query = Detection.query.filter_by(user_id=user.id).order_by(Detection.created_at.desc())
    
    # 获取总数
    total = query.count()
    
    # 分页
    detections = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # 构造响应
    response = {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
        "items": [detection.to_dict() for detection in detections.items]
    }
    
    return jsonify(response), 200

@detection_bp.route('/history/<int:detection_id>', methods=['GET'])
@jwt_required()
def get_detection(detection_id):
    """获取单个检测记录的详细信息"""
    user_id = get_jwt_identity()
    
    detection = Detection.query.filter_by(id=detection_id, user_id=user_id).first()
    
    if not detection:
        return jsonify({"error": "Detection not found"}), 404
    
    return jsonify(detection.to_dict()), 200

@detection_bp.route('/history/<int:detection_id>', methods=['DELETE'])
@jwt_required()
def delete_detection(detection_id):
    """删除检测记录"""
    user_id = get_jwt_identity()
    
    detection = Detection.query.filter_by(id=detection_id, user_id=user_id).first()
    
    if not detection:
        return jsonify({"error": "Detection not found"}), 404
    
    try:
        # 可选：删除关联的图像文件
        if detection.image_path and os.path.exists(detection.image_path):
            os.remove(detection.image_path)
            
        if detection.result_path and os.path.exists(detection.result_path):
            os.remove(detection.result_path)
        
        db.session.delete(detection)
        db.session.commit()
        
        return jsonify({"message": "Detection deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@detection_bp.route('/history/clear', methods=['DELETE'])
@jwt_required()
def clear_history():
    """清空用户的检测历史"""
    user_id = get_jwt_identity()
    
    try:
        # 获取用户的所有检测记录
        detections = Detection.query.filter_by(user_id=user_id).all()
        
        # 删除相关文件
        for detection in detections:
            if detection.image_path and os.path.exists(detection.image_path):
                os.remove(detection.image_path)
                
            if detection.result_path and os.path.exists(detection.result_path):
                os.remove(detection.result_path)
        
        # 从数据库中删除记录
        Detection.query.filter_by(user_id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({"message": "Detection history cleared successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@detection_bp.route('/results/<filename>', methods=['GET'])
def get_result_image(filename):
    """获取检测结果图像"""
    result_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'results', filename)
    
    if not os.path.exists(result_path):
        return jsonify({"error": "Image not found"}), 404
    
    return send_file(result_path, mimetype='image/jpeg') 