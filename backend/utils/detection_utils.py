import os
import time
import cv2
import uuid
import numpy as np
from flask import current_app
from ultralytics import YOLO

# 缓存已加载的模型
model_cache = {}

def get_model(model_name):
    """获取或加载指定的YOLOv8模型"""
    if model_name in model_cache:
        return model_cache[model_name]
        
    # 检查模型是否存在
    model_folder = current_app.config['MODEL_FOLDER']
    yolo_models = {
        'yolov8n': 'yolov8n.pt',
        'yolov8s': 'yolov8s.pt',
        'yolov8m': 'yolov8m.pt',
        'yolov8l': 'yolov8l.pt',
        'yolov8x': 'yolov8x.pt'
    }
    
    if model_name not in yolo_models:
        model_name = 'yolov8s'  # 默认使用 yolov8s
        
    model_path = yolo_models[model_name]
    
    # 从本地加载或自动下载模型
    try:
        model = YOLO(model_path)
        model_cache[model_name] = model
        return model
    except Exception as e:
        print(f"Error loading model {model_name}: {e}")
        # 尝试加载默认模型
        if model_name != 'yolov8s':
            return get_model('yolov8s')
        raise

def detect_objects(image_path, model_name='yolov8s', confidence=0.25, save_result=True):
    """使用YOLOv8检测图像中的物体"""
    try:
        # 检查图像是否存在
        if not os.path.exists(image_path):
            return None, 0, None
            
        # 加载模型
        model = get_model(model_name)
        
        # 开始计时
        start_time = time.time()
        
        # 执行检测
        results = model(image_path, conf=confidence, verbose=False, save=False)
        
        # 计算处理时间
        processing_time = time.time() - start_time
        
        # 处理结果
        result_objects = []
        
        if results and len(results) > 0:
            # 获取第一张图片的结果
            result = results[0]
            
            # 将结果转换为列表
            for i, box in enumerate(result.boxes):
                box_data = box.data.tolist()[0]
                x1, y1, x2, y2, conf, cls = box_data
                
                class_id = int(cls)
                class_name = result.names[class_id]
                
                result_objects.append({
                    'id': i,
                    'class_id': class_id,
                    'class_name': class_name,
                    'confidence': round(float(conf), 4),
                    'bbox': {
                        'x1': round(float(x1), 2),
                        'y1': round(float(y1), 2),
                        'x2': round(float(x2), 2),
                        'y2': round(float(y2), 2),
                        'width': round(float(x2 - x1), 2),
                        'height': round(float(y2 - y1), 2)
                    }
                })
            
            # 保存结果图像
            result_path = None
            if save_result:
                img = cv2.imread(image_path)
                for obj in result_objects:
                    # 获取边界框
                    bbox = obj['bbox']
                    x1, y1 = int(bbox['x1']), int(bbox['y1'])
                    x2, y2 = int(bbox['x2']), int(bbox['y2'])
                    
                    # 绘制边界框
                    color = generate_color(obj['class_id'])
                    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                    
                    # 绘制标签
                    label = f"{obj['class_name']} {obj['confidence']:.2f}"
                    font_scale = 0.7
                    thickness = 2
                    (label_width, label_height), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
                    
                    # 标签背景
                    cv2.rectangle(img, (x1, y1 - label_height - 10), (x1 + label_width, y1), color, -1)
                    
                    # 标签文本
                    cv2.putText(img, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), thickness)
                
                # 保存结果图像
                result_filename = f"result_{uuid.uuid4().hex}.jpg"
                result_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'results', result_filename)
                os.makedirs(os.path.dirname(result_path), exist_ok=True)
                cv2.imwrite(result_path, img)
            
        return result_objects, processing_time, result_path
    except Exception as e:
        print(f"Error in object detection: {e}")
        return None, 0, None

def generate_color(class_id):
    """为类别生成唯一颜色"""
    colors = [
        (255, 0, 0),    # 红色
        (0, 255, 0),    # 绿色
        (0, 0, 255),    # 蓝色
        (255, 255, 0),  # 黄色
        (255, 0, 255),  # 洋红色
        (0, 255, 255),  # 青色
        (255, 165, 0),  # 橙色
        (128, 0, 128),  # 紫色
        (0, 128, 0),    # 深绿色
        (139, 69, 19)   # 褐色
    ]
    
    return colors[class_id % len(colors)]

def get_available_models():
    """获取可用模型列表"""
    models = [
        {"id": "yolov8n", "name": "YOLOv8 Nano", "description": "Fastest, smaller model, lower accuracy."},
        {"id": "yolov8s", "name": "YOLOv8 Small", "description": "Good balance of speed and accuracy."},
        {"id": "yolov8m", "name": "YOLOv8 Medium", "description": "Medium size model with better accuracy."},
        {"id": "yolov8l", "name": "YOLOv8 Large", "description": "Large model with high accuracy."},
        {"id": "yolov8x", "name": "YOLOv8 XLarge", "description": "Extra-large model for highest accuracy."}
    ]
    
    return models 