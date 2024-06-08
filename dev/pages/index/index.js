/*
 * @Description: Description
 * @Author: lishen
 * @Date: 2023-08-31 16:46:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-08 22:16:48
 */
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { MultiPlugin, MULTI_PLUGIN_KEY } = require('../../plugins/wc-plugin-multiple/index');

WxCalendar.use(MultiPlugin);

Page({
  data: {
    padding: 0
  },
  onLoad() {
    const { bottom } = wx.getMenuButtonBoundingClientRect();
    this.setData({
      padding: bottom
    });
  },
  handleLoad() {
    const calendar = this.selectComponent('#calendar');
    const multiSelector = calendar.getPlugin(MULTI_PLUGIN_KEY);
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    multiSelector.select([
      { year, month, day: 3 },
      { year, month, day: 28 }
    ]);
  },
  handleChange({ detail }) {
    console.log('calendar-date-change', detail);
  },
  handleViewChange({ detail }) {
    console.log('calendar-view-change', detail);
  },
  handleSchedule(e) {
    console.log('handleSchedule', e);
  }
});
