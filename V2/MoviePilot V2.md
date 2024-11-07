# MoviePilot V2 使用指南

## 部署

**下载** [Docker Compose文件](https://github.com/4Nest/MoviePilot-Settings/blob/main/V2/docker-compose.yml)并**构建**

[Docker Compose | 菜鸟教程](https://www.runoob.com/docker/docker-compose.html)

## 初始化

启动MPv2，等待下载更新。

初始化生成**随机管理员密码**，在日志中查看。**如图**

![password.jpg](https://raw.githubusercontent.com/4Nest/MoviePilot-Settings/refs/heads/main/V2/src/password.jpg)

默认账号：**admin**



## 配置

> **以下每个步骤都切记点击保存**

### 下载器

设定 - 系统 - 下载器

添加 qBittorrent/Transmission 并设置默认下载器

### 媒体服务器

设定 - 系统 - 媒体服务器

添加 Emby/Jellyfin/Plex 并设置默认媒体服务器

### 二级分类策略

[官方Wiki](https://wiki.movie-pilot.org/zh/advanced)

插件 - 插件市场 - 二级分类策略

参考：

```
movie:
  动画电影:
    genre_ids: '16'
  华语电影:
    original_language: 'zh,cn,bo,za'
  现场:
    genre_ids: '10402'  
  外语电影:

tv:
  国漫:
    genre_ids: '16'
    origin_country: 'CN,TW,HK'
  日番:
    genre_ids: '16'
    origin_country: 'JP'
  纪录片:
    genre_ids: '99'
  综艺:
    genre_ids: '10764,10767'
  国产剧:
    origin_country: 'CN,TW,HK'
  欧美剧:
    origin_country: 'US,FR,GB,DE,ES,IT,NL,PT,RU,UK'
  日韩剧:
    origin_country: 'JP,KP,KR,TH,IN,SG'
  未分类:
```

### 存储目录

> **下载目录**即为**下载器**下载的文件目录                参考图中**Raw**文件夹
> 
> **媒体库目录**即为**媒体服务器**挂载的文件目录     参考图中**link**文件夹

####目录参考（图中为 方案二）

![dir.png](https://raw.githubusercontent.com/4Nest/MoviePilot-Settings/refs/heads/main/V2/src/dir.png)

 

#### 部分选项解释

**类型** - 二级策略中的movie、tv

**类别** - 二级策略中的国漫、日番等

**下载器监控** - 下载器下载完成再转移

**目录监控** - 文件变动即转移

**智能重命名** - 自动按照规定格式重命名

#### 方案一

> 使用二次分类策略自动分类

如图：

![Type 1.png](https://github.com/4Nest/MoviePilot-Settings/blob/main/V2/src/Type1.png?raw=true)

#### 方案二

> 对每个分类进行单独设置
> 
> 可与方案一组合使用

![Type2.png](https://github.com/4Nest/MoviePilot-Settings/blob/main/V2/src/Type2.png?raw=true)

### 整理刮削

##### 电影重命名格式

参考[PiliPili WIKI](https://wiki.touhou.ing/advanced/006.html)

```
{{title}} ({{year}})/{{title}} ({{year}}) - {{videoFormat}}{% if videoCodec %}.{{videoCodec}}{% endif %}{% if audioCodec %}.{{audioCodec}}{% endif %}{% if customization %}.{{customization}}{% endif %}{%if effect %}.{{effect}}{% endif %}{% if releaseGroup %}.{{releaseGroup}}{% endif %}{{fileExt}}
```

##### 电视剧重命名格式

```
{{title}} ({{year}})/Season {{season}}/{{title}} {{season_episode}} {{videoFormat}}{% if customization %}.{{customization}}{% endif %}{% if releaseGroup %}.{{releaseGroup}}{% endif %}{{fileExt}}
```

##### 效果图

![](https://img.155155155.xyz/i/2024/10/670a9e266821f.webp)

### 站点同步

###### 安装CookieCloud

安装CookieCloud浏览器插件

[Edge](https://microsoftedge.microsoft.com/addons/detail/cookiecloud/bffenpfpjikaeocaihdonmgnjjdpjkeo)|[Chrome](https://chromewebstore.google.com/detail/cookiecloud/ffjiejobkoibkjlhjnlgmcnnigeelbdl)

Docker-compose：

```
version: '3'
services:
  cookiecloud:
    image: easychen/cookiecloud:latest
    container_name: cookiecloud-app
    restart: always
    volumes:
      - ./data:/data/api/data
    ports:
      - 8088:8088
```

[easychen/CookieCloud · GitHub](https://github.com/easychen/CookieCloud/blob/master/README_cn.md)

###### 自建

取消勾选本地服务器

填写服务器地址，例：**https://movie-pilot.org/cookiecloud**

用户Key：客户端生成

端对端加密密码：客户端生成

###### 内置

勾选本地服务器

###### 浏览器插件设置

服务器地址：http://domain/cookiecloud

用户KEY：重新生成（填写到mp中）

端对端加密密码：重新生成（填写到mp中）

**设置完成后保存同步**

**到MP 设定 - 服务 - 同步CookieCloud站点 执行**

### 规则

> 导入保存即可
> 
> 此规则仅供参考学习
> 
> 自己理解优先级才能调试出最符合自己的规则

#### 自定义规则

```
[{"id":"Complete","name":"Complete","include":"(全|共)\\d(集|期)|完结|合集|Complete","exclude":""},{"id":"filterGlobal","name":"filterGlobal","include":"","exclude":"(?i)日语无字|先行|DV|MiniBD|DIY原盘|iPad|UPSCALE|AV1|BDMV|RMVB|DVD|vcd|480p|OPUS","seeders":""},{"id":"filerGroup","name":"filerGroup","include":"","exclude":"(?i)SubsPlease|Up to 21°C|VARYG|TELESYNC|NTb|sGnb|BHYS|HDSWEB|DBD|HDH|COLLECTiVE|SRVFI|HDSPad"},{"id":"filterMovie","name":"filterMovie","include":"","exclude":"","size_range":"0-22000","seeders":""},{"id":"filterSeries","name":"filterSeries","include":"","exclude":"","size_range":"0-102400"},{"id":"AnimeGroup","name":"AnimeGroup","include":"7³ACG|VCB-Studio","exclude":"","size_range":""},{"id":"Audiences","name":"Audiences","include":"ADE|ADWeb","exclude":"","seeders":""},{"id":"HHWEB","name":"HHWEB","include":"HHWEB","exclude":""},{"id":"Crunchyroll","name":"Crunchyroll","include":"CR|Crunchyroll","exclude":""},{"id":"Netflix","name":"Netflix","include":"Netflix|NF","exclude":""},{"id":"B-Global","name":"B-Global","include":"B-Global|BG","exclude":""},{"id":"AMZN","name":"AMZN","include":"AMZN|Amazon","exclude":""},{"id":"HQ","name":"HQ","include":"HQ|高码|EDR","exclude":"","size_range":""},{"id":"DDP","name":"DDP","include":"DDP","exclude":""}]
```

#### 优先级规则组

```
[{"name":"前置过滤","rule_string":"filterGlobal& !BLU & !REMUX & !3D & !DOLBY &filerGroup","media_type":"","category":""},{"name":"动画电影","rule_string":" SPECSUB & 4K & BLURAY & H265 > CNSUB & 4K & BLURAY & H265 > CNSUB & 4K & BLURAY > CNSUB & 1080P & BLURAY > CNSUB & 4K > CNSUB & 1080P ","media_type":"电影","category":"动画电影"},{"name":"华语电影","rule_string":" 4K & BLURAY & H265 > 1080P & BLURAY > 4K > 1080P ","media_type":"电影","category":"华语电影"},{"name":"外语电影","rule_string":" SPECSUB & 4K & BLURAY & H265 &filterMovie> CNSUB & 4K & BLURAY & H265 &filterMovie> CNSUB & 1080P & BLURAY &filterMovie> CNSUB & 4K &filterMovie> CNSUB & 1080P &filterMovie","media_type":"电影","category":"外语电影"},{"name":"日番","rule_string":"AnimeGroup& CNSUB & BLURAY & 1080P >Audiences& H265 & BLURAY & 1080P >Audiences&AMZN&HHWEB& CNSUB & 1080P >Audiences&Crunchyroll& CNSUB & 1080P >Audiences&Netflix&HHWEB& CNSUB & 1080P >Audiences&B-Global& 4K & CNSUB >Audiences&B-Global& 1080P & CNSUB >Audiences&HHWEB& CNSUB & 1080P > CNSUB & BLURAY & 1080P > 1080P & CNSUB > 1080P ","media_type":"电视剧","category":"日番"},{"name":"国漫","rule_string":" 4K &Audiences&HHWEB&DDP> 4K &Audiences&HHWEB> 1080P &Audiences&HHWEB> 4K > 1080P > 720P ","media_type":"电视剧","category":"国漫"},{"name":"纪录片","rule_string":" 4K & BLURAY > 1080P & BLURAY > 4K > 1080P ","media_type":"电视剧","category":"纪录片"},{"name":"综艺","rule_string":" 4K & WEBDL &Complete> 4K & WEBDL &HHWEB> WEBDL & 1080P &HHWEB> 4K & WEBDL &Audiences> 1080P &Audiences& WEBDL > 1080P ","media_type":"电视剧","category":"综艺"},{"name":"国产剧","rule_string":" 4K & WEBDL &HQ> 4K & WEBDL > 4K & WEBDL > 1080P > 720P ","media_type":"电视剧","category":"国产剧"},{"name":"欧美剧","rule_string":" SPECSUB & 1080P & BLURAY &filterSeries> 1080P & WEBDL & CNSUB &filterSeries> CNSUB &filterSeries","media_type":"电视剧","category":"欧美剧"},{"name":"日韩剧","rule_string":" SPECSUB & 1080P & BLURAY &filterSeries> CNSUB & 1080P &filterSeries> 1080P & CNSUB &filterSeries> CNSUB &filterSeries ","media_type":"电视剧","category":"日韩剧"},{"name":"现场","rule_string":" CNSUB & 4K > CNSUB & 1080P > 4K > 1080P > !720P ","media_type":"电影","category":"现场"}]
```

### 搜索&下载

#### 基础设置

优先级规则组：可以使用规则搜索，或者留空

**规则越复杂，搜索速度越慢**

#### 搜索站点

如果搜索速度很慢，可在日志中查看是哪个站点耗时最久，酌情取消搜索

### 订阅

#### 基础设置

订阅模式 - 推荐站点RSS

订阅优先级规则组 - 留空全选

订阅定时搜索 - 如果没有漏订阅可以不要开启

#### 订阅站点

订阅的影片会从选中的站点订阅

在此需要解释一下订阅运行流程：

1. 订阅影片

2. 等待一分钟后执行搜索（站点搜索，补齐前面未下的集数）

3. 按照设定周期**自动爬取站点/检索RSS**获取种子

4. 识别种子是否为订阅的影片

### 通知

[官方Wiki](https://wiki.movie-pilot.org/zh/notification)

### 词表

#### 自定义识别词

```
[Movie\]
episode\.\d{1}
\.(第\d{1,2}集)\. => \1
(?i)Season( *)0?(\d+) => S\2
(?<=SBSUB.*DR.*?)- => part
\[CHS\_CHT\_JP\]\(\w{8}\)
\[CHT\_JP\]\(\w{8}\)
\[CHS\_JP\]\(\w{8}\)
chs&jpn => jpsc
cht&jpn => jptc
\[SBSUB\]\[CONAN\]\[DR => [银色子弹字幕组][名侦探柯南][S01E
\[SBSUB\]\[CONAN\]\[ => [银色子弹字幕组][名侦探柯南][S01E
(?<=VCB-Studio.*?)2nd Season => S02
(?<=VCB-Studio.*?)IV => S04
(?<=VCB-Studio.*?)III => S03
(?<=VCB-Studio.*?)II => S02
[【\[](Fin|END)[】\]]|(?:|\s|\s-\s)(Fin|END)(?=\])|(?<=\d{1,2})_?(Fin|END)
(?<=[\[【].*?(?:组|組|sub|S(?:UB|ub|tudio)|Raw(?:|s)|社)[\]】])(?:(?:\[|【|★|)\d{1,2}月新番(?:\]|】|★|)|)[\[【](.*?)[\]】] => \1
(?<=[\W_])(CR|Baha|KKTV|Abema|B-Global|Sentai|MyVideo|AMZN|KKTV|friDay|DSNP|LINETV|NF|Viu)(?=[\W_]) => -\1
(?i)(CHS|GB|SC)(&|_|＆|\x20)(CHT|BIG5|TC)(&|_|＆|\x20)JA?PN? => 简繁日内封
(?i)(CHS|GB|SC)_JA?PN?(&|＆|\x20)(CHT|BIG5|TC)_JA?PN? => 简繁日内封
(?i)(CHS|GB|SC)(&|＆|\x20)(CHT|BIG5|TC) => 简繁内封
(?i)(CHS|GB|SC)(_|&|＆|\x20)JA?PN? => 简日双语
(?i)\[JA?PN?(_|&|＆|\x20)?(SC|CHS|GB)\] => [简日双语]
(.*)(VCB-Studio)(.*)(Ma10p_?|Hi10p_?)(.*) => \1\2\3\5
S(eason)? ?0?([2-9]) *\[(OVA|OAD)0?\(?(\d)?\)?\] => S0E\2\4
(S(eason)? ?0?1 *)?\[(OVA|OAD)(\d+)?\] => S0E\4
(S(eason)? ?\d+)? *\[\d+\(?(OVA|OAD)\)?\] => S0
(?<=[\W_])4(?:k|K)(?=[\W_]) => 2160p
(?i)\bSBSUB\b => 银色子弹字幕组
(?i)\bNekomoe kisstan\b => 喵萌奶茶屋
(?i)\bOPFansMaplesnow\b => OPFans枫雪动漫
(?i)\bSakurato\b|樱都字幕组|桜都字幕组|桜都 => 桜都字幕组
(?i)\bHaruhana\b => ❀拨雪寻春❀
(?<=[\W_])CR(?=[\W_]) => Crunchyroll
(?<=[\W_])NF(?=[\W_]) => Netflix
(?<=[\W_])AMZN(?=[\W_]) => Amazon
(?<=[\W_])((H?MAX)|ATVP)(?=[\W_]) => -\1
(?<=[\W_])ATVP(?=[\W_]) => AppleTV+
(?<=[\W_])DSNP(?=[\W_]) => Disney+
(?<=(1080p|2160p)\.)Max\. => -MAX.
(?<=(1080p|2160p)\.)iT\. => -iTunes.
(?<!-)(Disney\+|playWEB|Crunchyroll|Netflix|Amazon|AppleTV\+) => -\1

```

#### 自定义制作组/字幕组

```
喵萌奶茶屋
风车字幕组
银色子弹字幕组
枫叶字幕组
诸神字幕组
❀拨雪寻春❀
VARYG
AI-Raws
ANi
SweetSub
LoliHouse
VCB-Studio
7³ACG
OPFans枫雪动漫
SilverBullet
APTX4869
Snow-Raws
B-Global
CR
KKTV
Baha
MyVideo
AMZN
KKTV
friDay
Disney+
LINETV
NF
Viu
Crunchyroll
Netflix
Amazon
MAX
AppleTV+
HMAX
BiliBili
Abema
CatchPlay
iTunes
Remux
ADWeb
NTb
FLUX
DSNP
银色子弹字幕组
RLWeb
Breeze@Sunny
Rain@Sunny
RLeaves
```

#### 自定义占位符

```
\b(简繁内封|简繁日内封|简繁日英内封|简繁官字内封|官简内封|简日双语|简体内封|简体内嵌|繁体内嵌|简英双语|简繁外挂|简体|HDR|DoVi)\b

```

#### 文件整理屏蔽词

```
__\w{6}/
Special Ending Movie
\[((TV|BD|\bBlu-ray\b)?\s*CM\s*\d{2,3})\]
\[Teaser.*?\]
\[PV.*?\]
\[NC[OPED]+.*?\]
\[S\d+\s+Recap(\s+\d+)?\]
Menu
Preview
\b(CDs|SPs|Scans|Bonus|映像特典|映像|specials|特典CD|Menu|Logo|Preview|/mv)\b
\b(NC)?(Disc|片头|OP|OVA|OAD|SP|ED|Advice|Trailer|BDMenu|片尾|PV|CM|Preview|MENU|Info|EDPV|SongSpot|BDSpot)(\d{0,2}|_ALL)\b
WiKi.sample
```

## 如何自己写识别词

```
一念永恒.Yi.Nian.Yong.Heng.S03E10.2024.2160p.WEB-DL.H265.DDP2.0
```

### 问题一

TMDB此片为第一季，而站点中为第三季，不能匹配

![](https://github.com/4Nest/MoviePilot-Settings/blob/main/V2/src/WordsWrite1.png?raw=true)

### 解决

1. 到[TMDB](https://www.themoviedb.org/tv/107371/season/1)找到词条

2. 找到第三季开始集数（本片为107集）

3. 按照格式书写识别词

```
Yi.Nian.Yong.Heng.S03E => Yi.Nian.Yong.Heng.S01E && S01E <> 2024 >> EP+106
```

> 支持的配置格式（注意空格）：
> 屏蔽词
> 被替换词 => 替换词
> 前定位词 <> 后定位词 >> 集偏移量（EP）
> 被替换词 => 替换词 && 前定位词 <> 后定位词 >> 集偏移量（EP）
> 其中替换词支持格式：{[tmdbid/doubanid=xxx;type=movie/tv;s=xxx;e=xxx]} 直接指定TMDBID/豆瓣ID识别，其中s、e为季数和集数（可选）

### 问题二

重新搜索发现年份不匹配（如果是RSS订阅识别则无此问题）

> 此问题多发生于**Yi Nian Yong Heng S03E04 2024**这种年份在集数后面的命名

![1](https://github.com/4Nest/MoviePilot-Settings/blob/main/V2/src/WordsWrite2.png?raw=true)

### 解决

1. 找到该片的最早发行年份

2. 把年份修改为最早发行年份（本片为2020）

```
(?<=Yi.Nian.Yong.Heng.S03.*?)2024 => 2020
```

### 组合

问题一与问题二为组合问题，所以需要明白优先

1. 先识别到年份

2. 再替换季度

识别词为从上到下的顺序

```
(?<=Yi.Nian.Yong.Heng.S03.*?)2024 => 2020
```

先执行后，文件变成了

```
一念永恒.Yi.Nian.Yong.Heng.S03E10.2020.2160p.WEB-DL.H265.DDP2.0
```

如果依旧使用问题一解决方法，因为年份改动不匹配，所以需要重新适配

```
Yi.Nian.Yong.Heng.S03E => Yi.Nian.Yong.Heng.S01E && S01E <> 2020 >> EP+106
```

最后组合在一起就是

```
(?<=Yi.Nian.Yong.Heng.S03.*?)2024 => 2020
Yi.Nian.Yong.Heng.S03E => Yi.Nian.Yong.Heng.S01E && S01E <> 2020 >> EP+106
```

最后成功下载

![1](https://github.com/4Nest/MoviePilot-Settings/blob/main/V2/src/WordsWrite3.png?raw=true)

![1](https://github.com/4Nest/MoviePilot-Settings/blob/main/V2/src/WordsWrite4.png?raw=true)





# **MoviePoilt相关教程和工具**



- [Putarku/MoviePilot-Help](https://github.com/Putarku/MoviePilot-Help)：MP百科布丁
- [DDS-Derek/MoviePilot](https://github.com/DDS-Derek/MoviePilot/tree/docs)：MoviePilot常见问题及其解决办法 & 部分自建功能教程
- [developer-wlj/Windows-MoviePilot](https://github.com/developer-wlj/Windows-MoviePilot)：exe方式运行MoviePilot
- [PTLSP/MoviePilot-Wechat-PROXY](https://blog.ptlsp.com/moviepilotwechat)：MoviePilot企业微信推送之新手喂饭教程
- [MoviePilot部署教程](https://blog.zwbcc.cn/archives/1711674204030)：MoviePilot新手部署教程
- [MoviePilot配置教程](https://blog.goalonez.site/blog/MoviePilot%E9%85%8D%E7%BD%AE-Nas%E5%AA%92%E4%BD%93%E5%BA%93%E8%87%AA%E5%8A%A8%E5%8C%96%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7.html)：MoviePilot配置-Nas媒体库自动化管理工具
- [MoviePilot配置教程](https://hackfang.me/movie-pilot-install-and-guide)：自动化观影平台MoviePilot安装与使用
- [企业微信推送配置教程](https://pt-helper.notion.site/50a7b44e255d40109bd7ad474abfeba5)：企业微信推送
- [moviepilotNameTest](https://greasyfork.org/zh-CN/scripts/486188-moviepilotnametest)：从站点页面发送种子到MP的油猴脚本
- 


