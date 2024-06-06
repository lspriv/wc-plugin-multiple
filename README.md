## Wx Calendar Plugin For MultiSelector
![NPM Version](https://img.shields.io/npm/v/@lspriv/wc-plugin-multiple)
![Static Badge](https://img.shields.io/badge/coverage-later-a9a9a9)
![GitHub License](https://img.shields.io/github/license/lspriv/wc-plugin-multiple)

小程序日历 [`wx-calendar`](https://github.com/lspriv/wx-calendar) 多选插件

[![pktB9yT.png](https://s21.ax1x.com/2024/06/08/pktB9yT.png)](https://imgse.com/i/pktB9yT)

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
```html
<calendar id="calendar" bindchange="handleChange" />
```
```javascript
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { MultiPlugin, MULTI_PLUGIN_KEY } = require('@lspriv/wc-plugin-ics');

WxCalendar.use(MultiPlugin, { 
  ... // 见插件选项，也可以不传选项，使用默认选项
});

Page({
  handleCalendarLoad() {
    const calendar = this.selectComponent('#calendar');
    const multiSelector = calendar.getPlugin(MULTI_PLUGIN_KEY);
    multiSelector.select([
      { year: 2024, month: 6, day: 3 },
      { year: 2024, month: 6, day: 28 }
    ]);
  },
  handleChange(e) {
    const { checked } = e;
    // 选中的日期
    console.log('checked', checked);
  }
})
```

### 插件选项

<table>
    <tr>
        <th>选项</th>
        <th>类型</th>
        <th>说明</th>
        <th>默认值</th>
    </tr>
    <tr>
        <td>type</td>
        <td>'range' | 'multi'</td>
        <td>范围选择/多点选择</td>
        <td>range</td>
    </tr>
    <tr>
        <td>bgColor</td>
        <td>string</td>
        <td>选中背景色</td>
        <td>var(--wc-checked-today-bg)</td>
    </tr>
    <tr>
        <td>textColor</td>
        <td>string</td>
        <td>选中字体色</td>
        <td>true</td>
    </tr>
    <tr>
        <td>borderRadius</td>
        <td>string</td>
        <td>选中背景圆角</td>
        <td>50%</td>
    </tr>
</table>

### 触发事件

[***`bindchange`***](#bindchange)  日期选中变化
```typescript
type ChangeEventDetail = {
    checked: Array<CalenderDay>; // 当前选择日期
}
```

### 方法

[***`select`***](#select) 选择日期
```typescript
{
  /**
   * @param dates 选中日期，范围选择下如 [start, end] 格式
   * @param clear 是否清除原有选中日期，多点选择模式下有效，默认 false
   */
  (dates: Array<CalendarDay>, clear?: boolean): void;
}
```

### 关于

>     有任何问题或是需求请到 `Issues` 面板提交
>     忙的时候还请见谅
>     有兴趣开发维护的道友加微信

![wx_qr](https://chat.qilianyun.net/static/git/calendar/wx.png)

