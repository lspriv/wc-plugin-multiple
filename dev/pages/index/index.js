/*
 * @Description: Description
 * @Author: lishen
 * @Date: 2023-08-31 16:46:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-06-06 14:15:12
 */
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { MultiPlugin } = require('../../plugins/wc-plugin-multiple/index');

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
    /** @type {ICSPlugin} */
    // const ics = calendar.getPlugin(ICS_PLUGIN_KEY);
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
