# ObjectDetectAI - 多语言物体检测平台

ObjectDetectAI 是一个现代化的网络应用程序，利用人工智能技术为用户提供先进的物体检测功能。该平台支持多种语言，让全球用户都能轻松使用。

## 功能特点

- **实时物体检测**：上传图像，立即获得准确的物体识别结果
- **多语言支持**：界面支持英语、中文、西班牙语、法语等多种语言
- **用户友好界面**：直观的拖放上传、简单的模型选择和结果查看
- **多种检测模型**：支持不同规模和用途的YOLOv8模型
- **可调整检测参数**：根据需要自定义置信度阈值和预处理选项
- **检测历史**：保存和管理过去的检测结果
- **响应式设计**：适配桌面和移动设备的完美体验
- **暗色/亮色主题**：根据个人偏好或系统设置选择显示模式
- **用户账户系统**：注册和登录以保存个人设置和历史记录

## 技术栈

### 前端
- **Vue.js 3**：现代化、高性能的JavaScript框架
- **Vuex**：状态管理
- **Vue Router**：客户端路由
- **Vue I18n**：国际化支持
- **Vuetify**：Material Design组件库
- **Tailwind CSS**：实用优先的CSS框架
- **Axios**：HTTP请求处理

### 后端
- **Flask**：Python Web框架
- **SQLAlchemy**：ORM数据库交互
- **YOLOv8**：物体检测模型
- **JWT**：身份验证
- **MySQL**：数据存储

## 快速开始

### 前端设置

1. 克隆仓库并进入项目目录：
```bash
git clone https://github.com/yourusername/objectdetectai.git
cd objectdetectai/frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run serve
```

4. 构建生产版本：
```bash
npm run build
```

### 后端设置

1. 进入后端目录：
```bash
cd ../backend
```

2. 创建并激活虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # 在Windows上使用: venv\Scripts\activate
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 设置环境变量：
```bash
export FLASK_APP=app.py
export FLASK_ENV=development
# 设置数据库URI和密钥
export DATABASE_URI="mysql://username:password@localhost/objectdetect"
export SECRET_KEY="your-secret-key"
```

5. 初始化数据库：
```bash
flask db upgrade
```

6. 启动服务器：
```bash
flask run
```

## 系统架构

该应用采用前后端分离架构：

- **前端**：Vue.js单页应用，负责用户界面和交互
- **后端**：Flask RESTful API，处理业务逻辑、数据存储和物体检测
- **数据库**：MySQL存储用户数据、检测历史和应用配置
- **物体检测**：YOLOv8模型运行在后端，提供图像处理和物体识别功能

## 物体检测模型

本应用使用YOLOv8（You Only Look Once version 8）模型系列进行物体检测。YOLOv8提供了多种不同大小的模型，以平衡性能和准确性：

- **YOLOv8n**：最小和最快的模型，适合资源受限环境
- **YOLOv8s**：小型模型，提供良好的速度/精度平衡
- **YOLOv8m**：中型模型，提高了精度
- **YOLOv8l**：大型模型，适合需要更高精度的应用
- **YOLOv8x**：超大型模型，提供最高精度

## 多语言支持

应用支持的语言包括：

- 英语 (English)
- 中文 (简体中文)
- 西班牙语 (Español)
- 法语 (Français)
- 德语 (Deutsch)
- 日语 (日本語)

用户可以通过界面轻松切换语言，系统会记住用户的语言偏好。

## API访问

注册用户可以生成API密钥，通过编程方式访问物体检测功能：

```bash
curl -X POST https://your-app-url.com/api/v1/detect \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@/path/to/your/image.jpg" \
  -F "model=yolov8s" \
  -F "confidence=0.5"
```

完整的API文档可在应用内的"API"部分找到。

## 贡献

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork项目
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交Pull Request

## 许可证

本项目采用MIT许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 电子邮件：contact@objectdetectai.com
- GitHub问题：[https://github.com/yourusername/objectdetectai/issues](https://github.com/yourusername/objectdetectai/issues) 