#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import logging
from pathlib import Path

try:
    from ultralytics import YOLO
except ImportError:
    print("Error: ultralytics package not found. Please install using: pip install ultralytics")
    sys.exit(1)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 模型路径
MODEL_DIR = Path(os.getenv('MODEL_FOLDER', 'models'))

# 要下载的模型列表
MODELS = [
    'yolov8n.pt',  # YOLOv8 Nano
    'yolov8s.pt',  # YOLOv8 Small
    'yolov8m.pt',  # YOLOv8 Medium
    'yolov8l.pt',  # YOLOv8 Large
    'yolov8x.pt',  # YOLOv8 XLarge
]

def download_models():
    """下载YOLOv8模型到指定目录"""
    # 确保模型目录存在
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"开始下载模型到 {MODEL_DIR.absolute()} 目录")
    
    # 下载每个模型
    for model_name in MODELS:
        model_path = MODEL_DIR / model_name
        
        # 检查模型是否已存在
        if model_path.exists():
            logger.info(f"模型 {model_name} 已存在，跳过下载")
            continue
        
        logger.info(f"下载模型 {model_name}...")
        try:
            # 使用ultralytics API下载模型
            model = YOLO(model_name)
            
            # 保存模型到指定路径
            model_file = Path(model.ckpt_path)
            if model_file.exists():
                logger.info(f"复制模型 {model_name} 到 {model_path}")
                import shutil
                shutil.copy(model_file, model_path)
            else:
                logger.error(f"模型文件不存在: {model_file}")
                
            logger.info(f"模型 {model_name} 下载完成")
        except Exception as e:
            logger.error(f"下载模型 {model_name} 时出错: {str(e)}")
    
    logger.info("所有模型下载完成")

if __name__ == "__main__":
    download_models() 