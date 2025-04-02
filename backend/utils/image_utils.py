import os
import cv2
import uuid
import numpy as np
from PIL import Image
from io import BytesIO
from flask import current_app
from werkzeug.utils import secure_filename
from urllib.request import urlopen

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, subfolder=''):
    """保存上传的文件到指定位置"""
    if not file:
        return None
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # 添加uuid前缀确保唯一性
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # 创建目标目录
        upload_folder = current_app.config['UPLOAD_FOLDER']
        if subfolder:
            target_dir = os.path.join(upload_folder, subfolder)
            os.makedirs(target_dir, exist_ok=True)
        else:
            target_dir = upload_folder
            
        # 保存文件
        file_path = os.path.join(target_dir, unique_filename)
        file.save(file_path)
        
        return file_path
    
    return None

def save_image_from_url(url, subfolder=''):
    """从URL下载并保存图像"""
    try:
        response = urlopen(url)
        image_data = response.read()
        
        # 检查图像类型
        pil_image = Image.open(BytesIO(image_data))
        image_format = pil_image.format.lower()
        
        if image_format not in ALLOWED_EXTENSIONS and image_format != 'jpeg':
            return None
            
        # 创建目标目录
        upload_folder = current_app.config['UPLOAD_FOLDER']
        if subfolder:
            target_dir = os.path.join(upload_folder, subfolder)
            os.makedirs(target_dir, exist_ok=True)
        else:
            target_dir = upload_folder
            
        # 保存文件
        unique_filename = f"{uuid.uuid4().hex}.{image_format}"
        file_path = os.path.join(target_dir, unique_filename)
        
        with open(file_path, 'wb') as f:
            f.write(image_data)
            
        return file_path
    except Exception as e:
        print(f"Error downloading image from URL: {e}")
        return None

def preprocess_image(image_path, preprocessing=None):
    """根据预处理参数处理图像"""
    if not preprocessing:
        preprocessing = {}
        
    # 读取图像
    img = cv2.imread(image_path)
    if img is None:
        return None
        
    # 应用预处理
    # 1. 调整大小
    if 'resize' in preprocessing:
        width = preprocessing['resize'].get('width')
        height = preprocessing['resize'].get('height')
        if width and height:
            img = cv2.resize(img, (width, height))
            
    # 2. 高斯模糊
    if preprocessing.get('gaussian_blur'):
        kernel_size = preprocessing['gaussian_blur'].get('kernel_size', 5)
        img = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)
        
    # 3. 锐化
    if preprocessing.get('sharpen'):
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        img = cv2.filter2D(img, -1, kernel)
        
    # 4. 调整对比度
    if 'contrast' in preprocessing:
        alpha = preprocessing['contrast'].get('alpha', 1.0)
        beta = preprocessing['contrast'].get('beta', 0)
        img = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
        
    # 保存预处理后的图像
    processed_path = image_path.replace('.', '_processed.')
    cv2.imwrite(processed_path, img)
    
    return processed_path

def get_image_dimensions(image_path):
    """获取图像尺寸"""
    try:
        img = Image.open(image_path)
        width, height = img.size
        return width, height
    except Exception as e:
        print(f"Error getting image dimensions: {e}")
        return None, None 