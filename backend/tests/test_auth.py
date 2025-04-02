import pytest
import json
from app import create_app
from models import db, User

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:'
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_register(client):
    # 测试用户注册
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'Password123'
    })
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user']['username'] == 'testuser'
    assert data['user']['email'] == 'test@example.com'

def test_register_invalid_data(client):
    # 测试无效数据注册
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'invalid_email',
        'password': 'short'
    })
    
    assert response.status_code == 400

def test_login(client):
    # 先创建用户
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'Password123'
    })
    
    # 测试登录
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'Password123'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user']['username'] == 'testuser'

def test_login_invalid_credentials(client):
    # 测试无效凭据登录
    response = client.post('/api/auth/login', json={
        'username': 'nonexistent',
        'password': 'wrong'
    })
    
    assert response.status_code == 401

def test_get_current_user(client):
    # 先创建用户并登录
    register_response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'Password123'
    })
    
    token = json.loads(register_response.data)['access_token']
    
    # 测试获取当前用户
    response = client.get('/api/auth/me', headers={
        'Authorization': f'Bearer {token}'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['username'] == 'testuser'
    assert data['email'] == 'test@example.com'

def test_update_current_user(client):
    # 先创建用户并登录
    register_response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'Password123'
    })
    
    token = json.loads(register_response.data)['access_token']
    
    # 测试更新当前用户
    response = client.put('/api/auth/me', 
        headers={'Authorization': f'Bearer {token}'},
        json={'username': 'newname', 'email': 'new@example.com'}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['user']['username'] == 'newname'
    assert data['user']['email'] == 'new@example.com' 