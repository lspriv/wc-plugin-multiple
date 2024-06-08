#!/usr/bin/env node
const path = require('path');
const { watch } = require('rollup');
const { loadConfigFile } = require('rollup/loadConfigFile');
const { execSync } = require('child_process');
const { PRJ_PATH, cli, now } = require('./utils');
const ora = require('ora');

require('colors');

const ENV = { cwd: PRJ_PATH, stdio: 'ignore' };
const STDIO_IGNORE = { stdio: 'ignore' };

const npmInstall = () => {
  try {
    execSync('cnpm -v', STDIO_IGNORE);
    execSync('cnpm i', ENV);
  } catch (e) {
    execSync('npm i', ENV);
  }
};

const spinner = ora();

try {
  spinner.start('check package @lspriv/wx-calendar');
  execSync('npm list @lspriv/wx-calendar --dept 0', ENV);
  spinner.succeed('package @lspriv/wx-calendar installed');
} catch (err) {
  spinner.start('installing dependencies');
  npmInstall();
  spinner.succeed('dependency installation complete');
}

let Flag = false;
let currTime = 0;

(async function () {
  const result = cli('islogin', false);
  if (!result.login) {
    throw new Error('please login to the devTools');
  }

  spinner.start('building npm');
  cli('build-npm', true, STDIO_IGNORE);
  spinner.succeed('build npm completed');

  spinner.start('loading rollup config');
  const { options, warnings } = await loadConfigFile(path.resolve(process.cwd(), 'rollup.config.js'), {
    bundleConfigAsCjs: true
  });
  spinner.succeed('rollup configuration loaded');

  warnings.count && warnings.flush();

  const watcher = watch(options);
  watcher.on('event', async e => {
    if (e.code === 'START') {
      currTime = process.uptime();
      console.log(`[${now().grey}] Starting ` + `pack`.cyan + `...`);
    }
    if (e.result) e.result.close();
    if (e.code === 'END') {
      const timediff = (process.uptime() - currTime).toFixed(3);
      const timestr = timediff > 1 ? `${timediff} s` : `${timediff * 1000} ms`;
      console.log(`[${now().grey}] Finished ` + `pack`.cyan + ` after ` + timestr.magenta);
      if (Flag) {
        cli('reset-fileutils', true, STDIO_IGNORE);
      } else {
        console.log(`[${now().grey}] Starting ` + `watch`.cyan + `...`);
        cli('open', true, STDIO_IGNORE);
        Flag = true;
      }
    }
    if (e.code === 'ERROR') {
      console.log(`[${now().grey}]`, 'Error'.red, e.error.message);
      watcher.close();
      process.exit(0);
    }
  });
})();
