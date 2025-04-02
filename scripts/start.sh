#!/bin/bash

# 启动脚本 - 用于快速启动ObjectDetectAI项目
# 支持不同启动模式：开发模式和生产模式

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

# 检查Docker是否已安装
check_docker() {
    if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
        print_red "错误: Docker 或 Docker Compose 未安装!"
        print_yellow "请安装 Docker 和 Docker Compose 后重试。"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    print_green "ObjectDetectAI 启动脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -d, --dev      启动开发模式（带有热重载和调试信息）"
    echo "  -p, --prod     启动生产模式"
    echo "  -b, --build    启动前重新构建容器"
    echo "  -s, --stop     停止并移除所有容器"
    echo "  -h, --help     显示该帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --dev       以开发模式启动"
    echo "  $0 --prod      以生产模式启动"
    echo "  $0 --build --dev   构建并以开发模式启动"
    exit 0
}

# 停止所有容器
stop_containers() {
    print_yellow "停止并移除所有容器..."
    docker-compose down
    print_green "所有容器已停止"
    exit 0
}

# 主函数
main() {
    # 默认值
    MODE="dev"
    BUILD=false

    # 如果没有参数，显示帮助
    if [ $# -eq 0 ]; then
        show_help
    fi

    # 解析参数
    while [ $# -gt 0 ]; do
        case "$1" in
            -d|--dev)
                MODE="dev"
                shift
                ;;
            -p|--prod)
                MODE="prod"
                shift
                ;;
            -b|--build)
                BUILD=true
                shift
                ;;
            -s|--stop)
                stop_containers
                ;;
            -h|--help)
                show_help
                ;;
            *)
                print_red "未知参数: $1"
                show_help
                ;;
        esac
    done

    # 检查Docker
    check_docker

    # 根据模式启动应用
    if [ "$MODE" = "dev" ]; then
        print_yellow "以开发模式启动 ObjectDetectAI..."
        if [ "$BUILD" = true ]; then
            print_yellow "重新构建容器..."
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
        fi
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
    else
        print_yellow "以生产模式启动 ObjectDetectAI..."
        if [ "$BUILD" = true ]; then
            print_yellow "重新构建容器..."
            docker-compose build
        fi
        docker-compose up -d
        print_green "ObjectDetectAI 已在后台启动"
        print_green "应用可通过 http://localhost:8080 访问"
    fi
}

# 执行主函数
main "$@" 