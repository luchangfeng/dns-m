#!/usr/bin/env node
const path = require('path');
const fs = require('fs-extra');
const nodeDns = require('dns');
const program = require('commander');
const { exec, execSync } = require('child_process');
const pkgInfo = require('../package.json');
const config = require('../data/config.json');

program
  .version(pkgInfo.version, '-v, --version');

const AUTO_KEY = 'auto';

program
  .command('ls')
  .description('List all available dns')
  .action(() => {
    let curDns = '';
    try {
      curDns = execSync(`networksetup -getdnsservers ${config.workservice}`, { encoding: 'UTF8' });
      curDns = curDns.trim();
      console.log('');
      console.log('  Current work service is', config.workservice);
      console.log('  Current DNS is', nodeDns.getServers().join(', '));
      console.log('');
    } catch (e) {
      console.error(e);
      return;
    }

    for (let i = 0, len = config.dnsList.length; i < len; i++) {
      const item = config.dnsList[i];
      console.log(
        ((item.name === AUTO_KEY && curDns.indexOf('aren\'t any') !== -1) || curDns === item.value) ? '*' : ' ',
        item.name,
        '-',
        item.value
      );
    }
  });

program
  .command('select <workserviceName>')
  .description('Select the work service, default service is "Wi-Fi"')
  .action(serviceName => {
    if (config.workservice !== serviceName) {
      config.workservice = serviceName;
      // Write the config to local file
      fs.writeFileSync(
        path.resolve(__dirname, '../data/config.json'),
        JSON.stringify(config, null, 2)
      );
    }
    console.log('Success.');
  });


program
  .command('add <name> <dns>')
  .description('Add one dns to list')
  .action((name, dns) => {
    name = name.trim();
    dns = dns.trim();
    for (let i = 0, len = config.dnsList.length; i < len; i++) {
      const item = config.dnsList[i];
      if (name === item.name) {
        console.error('The name already existed.');
        return;
      }
      if (dns === item.value) {
        console.error('The DNS already existed.');
        return;
      }
    }
    config.dnsList.push({ name, value: dns });
    // Write the config to local file
    fs.writeFileSync(
      path.resolve(__dirname, '../data/config.json'),
      JSON.stringify(config, null, 2)
    );
    console.log('Add success.');
  });

program
  .command('del <name>')
  .description('Delete one dns from list')
  .action((name) => {
    name = name.trim();
    if (name === AUTO_KEY) {
      console.error('Auto DNS can not delete.');
      return;
    }

    let isExisted = false;
    for (let i = 0, len = config.dnsList.length; i < len; i++) {
      const item = config.dnsList[i];
      if (name === item.name) {
        isExisted = true;
        config.dnsList.splice(i, 1);
        break;
      }
    }
    if (!isExisted) {
      console.error('DNS', name, 'not found.');
      return;
    }
    // Write the config to local file
    fs.writeFileSync(
      path.resolve(__dirname, '../data/config.json'),
      JSON.stringify(config, null, 2)
    );
    console.log('Delete success.');
  });

program
  .command('use <name>')
  .description('Use the specified dns, the system\'s dns will change to this value')
  .action(name => {
    const s = config.workservice;
    if (name === AUTO_KEY) {
      const cmd = `networksetup -setdnsservers ${s} empty`;
      exec(cmd, err => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Use success.');
      });
      return;
    }

    let isExisted = false;
    for (let i = 0, len = config.dnsList.length; i < len; i++) {
      const item = config.dnsList[i];
      if (name === item.name) {
        isExisted = true;
        exec(`networksetup -setdnsservers ${s} ${item.value}`, err => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Use success.');
        });
        return;
      }
    }

    if (!isExisted) {
      console.error('DNS', name, 'not found.');
    }
  });

program.parse(process.argv);
