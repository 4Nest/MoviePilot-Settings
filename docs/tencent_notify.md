# QQ订阅+通知教程

本教程用到的两个项目

1. [llonebot-docker](https://github.com/LLOneBot/llonebot-docker)
2. [LiteyukiBot](https://github.com/LiteyukiStudio/LiteyukiBot)

## QQ订阅

### 1.构建docker

```
version: '3'
services:
  llonebot-docker:
    image: mlikiowa/llonebot-docker:vnc
    tty: true
    container_name: llonebot-docker
    restart: always
    ports:
      - "5900:5900"
      - "6099:6099"
      - "3000:3000"    
      - "3001:3001"
    environment:
      - TZ=Asia/Shanghai
      - VNC_PASSWD=yourpassword
    volumes:
      - ./LiteLoader/:/opt/QQ/resources/app/LiteLoader


  liteyukibot:
    image: git.liteyuki.icu/bot/app:latest
    restart: always
    ports:
    - "20216:20216"
    volumes:
    - ./LiteyukiBot:/liteyukibot
    - ./LiteyukiBot/.cache:/root/.cache
    environment:
    - TZ=Asia/Shanghai
#    - http_proxy=http://192.168.2.5:7890
#    - https_proxy=http://192.168.2.5:7890


```



### 2.修改liteyukibot配置文件

修改`LiteyukiBot/config/default.yml`

`host`修改为`0.0.0.0`

`superusers`修改为`你自己的qq号`

### 3.MP插件

[下载](https://github.com/4Nest/MoviePilot-Settings/blob/main/src/tencent_subscribe.py)

#### 修改插件

将插件中的mp_url、username、password修改为你自己的

#### 添加插件

进入`LiteyukiBot/src/liteyuki_plugins/nonebot/nonebot_plugins`

创建文件夹`nonebot_plugin_subscribe`

将插件重命名为`__init__.py`放入文件夹中

重启加载

### 4.登录QQ

使用VNC登录`x.x.x.x:5900`

密码为前面环境变量中设置的密码

### 5.设置LLOneBot插件

登录后进入设置中的LLOneBot

打开**启用WebSocket服务**

添加地址：`ws://x.x.x.x:20216/onebot/v11/ws`

点击保存

## QQ通知

### 1.安装插件

插件市场安装**聚合消息通知**

### 2.配置插件

选中ONEBOT-11

服务器地址：`http://x.x.x.x:3000`

