# Database Migrations

This directory contains database migration scripts managed by Flask-Migrate.

## 迁移命令

### 初始化迁移

```bash
flask db init
```

### 创建迁移脚本

```bash
flask db migrate -m "Initial migration"
```

### 应用迁移

```bash
flask db upgrade
```

### 回滚迁移

```bash
flask db downgrade
```

## 注意事项

- 每次对模型进行更改后，都应该生成新的迁移脚本
- 迁移前应该备份数据库
- 生产环境迁移前进行充分测试 