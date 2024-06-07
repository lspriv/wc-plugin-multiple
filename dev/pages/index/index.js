/*
 * @Description: Description
 * @Author: lishen
 * @Date: 2023-08-31 16:46:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-08 01:06:39
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
    multiSelector.select([
      { year: 2024, month: 6, day: 3 },
      { year: 2024, month: 6, day: 28 }
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
