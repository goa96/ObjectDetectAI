#!/bin/bash

# ObjectDetectAI 项目初始化脚本
# 用于新环境的首次设置和配置

# 输出带颜色的文本
print_green() {
    echo -e "\033[0;32m$1\033[0m"
}

print_yellow() {
    echo -e "\033[0;33m$1\033[0m"
}

print_red() {
    echo -e "\033[0;31m$1\033[0m"
}

# 检查项目目录结构
check_structure() {
    print_yellow "检查项目目录结构..."
    
    # 检查前端目录
    if [ ! -d "frontend" ]; then
        print_red "前端目录不存在!"
        mkdir -p frontend
        print_yellow "已创建前端目录"
    fi
    
    # 检查后端目录
    if [ ! -d "backend" ]; then
        print_red "后端目录不存在!"
        mkdir -p backend
        print_yellow "已创建后端目录"
    fi
    
    # 检查scripts目录
    if [ ! -d "scripts" ]; then
        mkdir -p scripts
        print_yellow "已创建scripts目录"
    fi
    
    # 创建后端上传和模型目录
    mkdir -p backend/uploads/images backend/uploads/results backend/models
    
    print_green "目录结构检查完成"
}

# 检查环境文件
check_env_files() {
    print_yellow "检查环境文件..."
    
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        print_yellow "已从示例创建.env文件"
    fi
    
    print_green "环境文件检查完成"
}

# 为启动脚本添加执行权限
add_permissions() {
    print_yellow "添加执行权限..."
    
    if [ -f "scripts/start.sh" ]; then
        chmod +x scripts/start.sh
        print_yellow "已为start.sh添加执行权限"
    fi
    
    if [ -f "scripts/setup.sh" ]; then
        chmod +x scripts/setup.sh
        print_yellow "已为setup.sh添加执行权限"
    fi
    
    if [ -f "backend/download_models.py" ]; then
        chmod +x backend/download_models.py
        print_yellow "已为download_models.py添加执行权限"
    fi
    
    print_green "执行权限添加完成"
}

# 创建docker-compose.override.yml用于本地开发配置
create_override() {
    if [ ! -f "docker-compose.override.yml" ]; then
        print_yellow "创建docker-compose.override.yml文件用于本地开发..."
        
        cat > docker-compose.override.yml << EOF
version: '3.8'

# 用于本地开发的覆盖配置
# 这个文件不会被版本控制，可以自由修改

services:
  # 自定义前端配置
  frontend:
    ports:
      - "8080:8080"  # 可以更改为你喜欢的端口
    environment:
      - NODE_ENV=development
  
  # 自定义后端配置
  backend:
    environment:
      - FLASK_DEBUG=1
      - SECRET_KEY=your_local_dev_key
      - JWT_SECRET_KEY=your_local_jwt_key
EOF
        
        print_green "docker-compose.override.yml文件创建完成"
    fi
}

# 主函数
main() {
    print_green "====== ObjectDetectAI 项目初始化 ======"
    
    # 检查目录结构
    check_structure
    
    # 检查环境文件
    check_env_files
    
    # 添加执行权限
    add_permissions
    
    # 创建docker-compose覆盖文件
    create_override
    
    print_green "====== 初始化完成 ======"
    print_green "你现在可以使用以下命令启动项目："
    print_yellow "开发模式：./scripts/start.sh --dev"
    print_yellow "生产模式：./scripts/start.sh --prod"
    print_yellow "构建并启动：./scripts/start.sh --build --dev"
}

# 执行主函数
main 