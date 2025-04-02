import pytest
import json
import os
import io
from app import create_app
from models import db, User, Detection

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'UPLOAD_FOLDER': '/tmp/test_uploads',
        'MODEL_FOLDER': '/tmp/test_models'
    })
    
    # 创建测试上传目录
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'images'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'results'), exist_ok=True)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
        
    # 清理测试上传目录
    import shutil
    shutil.rmtree(app.config['UPLOAD_FOLDER'], ignore_errors=True)
    
@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    # 创建测试用户并获取认证令牌
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'Password123'
    })
    
    return json.loads(response.data)['access_token']

def test_get_models(client):
    # 测试获取可用模型列表
    response = client.get('/api/detection/models')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) > 0
    assert 'id' in data[0]
    assert 'name' in data[0]
    assert 'description' in data[0]

def test_detect_without_auth(client):
    # 测试未认证时的检测请求
    response = client.post('/api/detection/detect')
    
    assert response.status_code == 401

def test_detect_without_image(client, auth_token):
    # 测试没有图像的检测请求
    response = client.post(
        '/api/detection/detect',
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    
    assert response.status_code == 400
    assert b'No valid image provided' in response.data

def test_get_history(client, auth_token):
    # 测试获取检测历史
    response = client.get(
        '/api/detection/history',
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'items' in data
    assert isinstance(data['items'], list)

# 注意：以下测试需要模拟YOLO模型，因为实际加载模型可能会很慢
# 这里简化为针对API接口结构的测试
def test_detect_mock(client, auth_token, monkeypatch):
    # 模拟detect_objects函数
    from utils.detection_utils import detect_objects
    
    def mock_detect_objects(*args, **kwargs):
        # 返回模拟的检测结果
        results = [
            {
                'id': 0,
                'class_id': 0,
                'class_name': 'person',
                'confidence': 0.95,
                'bbox': {
                    'x1': 100,
                    'y1': 100,
                    'x2': 200,
                    'y2': 300,
                    'width': 100,
                    'height': 200
                }
            }
        ]
        return results, 0.5, '/tmp/test_uploads/results/mock_result.jpg'
    
    # 应用模拟
    import utils.detection_utils
    monkeypatch.setattr(utils.detection_utils, 'detect_objects', mock_detect_objects)
    
    # 创建测试图像文件
    with open('/tmp/test_uploads/test_image.jpg', 'wb') as f:
        f.write(b'fake image data')
    
    # 测试检测API
    with open('/tmp/test_uploads/test_image.jpg', 'rb') as img:
        response = client.post(
            '/api/detection/detect',
            headers={'Authorization': f'Bearer {auth_token}'},
            data={
                'model': 'yolov8n',
                'confidence': '0.25'
            },
            content_type='multipart/form-data'
        )
    
    # 这里仅验证API响应结构，不验证实际检测结果
    assert response.status_code == 200 