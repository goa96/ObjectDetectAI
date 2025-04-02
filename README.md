# ObjectDetectAI - 多语言图像对象检测系统

一个基于Vue.js、Flask和YOLOv8的多语言图像对象检测系统，支持多种语言界面，提供直观的用户体验。

## 功能特点

- 基于YOLOv8的对象检测
- 多语言支持（中文、英文）
- 响应式设计，支持移动端和桌面端
- 用户账户管理与检测历史记录
- 图像上传和URL图像检测
- 可自定义检测参数
- 暗色模式支持

## 项目结构

项目分为前端和后端两部分：

- `frontend/`: Vue.js前端应用
- `backend/`: Flask后端应用
- `docker-compose.yml`: Docker配置文件

## 快速开始

### 使用Docker

1. 确保已安装Docker和Docker Compose
2. 克隆仓库：`git clone https://github.com/yourusername/ObjectDetectAI.git`
3. 进入项目目录：`cd ObjectDetectAI`
4. 启动服务：`docker-compose up -d`
5. 访问应用：`http://localhost:8080`

### 手动安装

#### 前端

```bash
cd frontend
npm install
npm run serve
```

#### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
flask run
```

## API文档

API文档可在后端运行后通过 `http://localhost:5000/api/docs` 访问。

## 配置

### 环境变量

前端环境变量在 `.env` 文件中配置：

```
VUE_APP_API_URL=http://localhost:5000
```

后端环境变量在 `.env` 文件或Docker配置中设置：

```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URI=mysql://username:password@localhost/dbname
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
```

## 开发

### 运行测试

```bash
# 前端测试
cd frontend
npm run test

# 后端测试
cd backend
pytest
```

### 构建生产版本

```bash
# 前端构建
cd frontend
npm run build

# 使用Docker构建整个应用
docker-compose build
```

## 许可证

[MIT](LICENSE)

## 作者

GYP
