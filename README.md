## Wx Calendar Plugin For MultiSelector
![NPM Version](https://img.shields.io/npm/v/@lspriv/wc-plugin-multiple)
![Static Badge](https://img.shields.io/badge/coverage-later-a9a9a9)
![GitHub License](https://img.shields.io/github/license/lspriv/wc-plugin-multiple)

小程序日历 [`wx-calendar`](https://github.com/lspriv/wx-calendar) 多选插件

<!-- [![pFaK8mj.png](https://s11.ax1x.com/2024/02/25/pFaK8mj.png)](https://imgse.com/i/pFaK8mj) -->

### 使用
- 小程序基础库 `SDKVersion` >= 3.0.0
- 日历组件 [`wx-calendar`](https://github.com/lspriv/wx-calendar) >= 1.6.0

#### 安装
```bash
npm i @lspriv/wc-plugin-multiple -S
```

#### 构建
微信小程序开发工具菜单栏：`工具` --> `构建 npm`
[*官方文档*](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html#_2-%E6%9E%84%E5%BB%BA-npm)

#### 页面使用
方式一
```javascript
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { MultiPlugin } = require('@lspriv/wc-plugin-ics');

WxCalendar.use(MultiPlugin);

Page({
  handleCalendarLoad() {
    const calendar = this.selectComponent('#calendar');
    // const ics = calendar.getPlugin(ICS_PLUGIN_KEY);
    // ics.load('https://***.***.ics');
  }
})
```

### 关于

>     有任何问题或是需求请到 `Issues` 面板提交
>     忙的时候还请见谅
>     有兴趣开发维护的道友加微信

![wx_qr](https://chat.qilianyun.net/static/git/calendar/wx.png)

