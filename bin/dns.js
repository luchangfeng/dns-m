#!/usr/bin/env node
const path = require('path');
const fs = require('fs-extra');
const nodeDns = require('dns');
const program = require('commander');
const { exec, execSync } = require('child_process');
const pkgInfo = require('../package.json');
const DMRC = path.join(process.env.HOME, '.dmrc');
const AUTO_KEY = 'auto';

const getConfig = () => {
  let c = null;

  try {
    c = JSON.parse(fs.readFileSync(DMRC, 'utf-8'));
  } catch (e) {
    const defConfig = require('../data/config.json');
    c = defConfig;
  }

  return c;
}

let config = getConfig();

const dnsList = () => {
  let curDns = '';
  try {
    curDns = execSync(`networksetup -getdnsservers ${config.workservice}`, {
      encoding: 'UTF8'
    });
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
};

const selectWorkService = serviceName => {
  if (config.workservice !== serviceName) {
    config.workservice = serviceName;
    // Write the config to local file
    fs.writeFileSync(
      DMRC,
      JSON.stringify(config, null, 2)
    );
  }
  console.log('Success.');
};

const addDns = (name, dns) => {
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
    DMRC,
    JSON.stringify(config, null, 2)
  );
  console.log('Add success.');
};

const delDns = name => {
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
    DMRC,
    JSON.stringify(config, null, 2)
  );
  console.log('Delete success.');
};

const useDns = name => {
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
};


// Define the commands
program
  .version(pkgInfo.version, '-v, --version');

program
  .command('ls')
  .description('List all available dns')
  .action(dnsList);

program
  .command('select <workserviceName>')
  .description('Select the work service, default service is "Wi-Fi"')
  .action(selectWorkService);

program
  .command('add <name> <dns>')
  .description('Add one dns to list')
  .action(addDns);

program
  .command('del <name>')
  .description('Delete one dns from list')
  .action(delDns);

program
  .command('use <name>')
  .description('Use the specified dns, the system\'s dns will change to this value')
  .action(useDns);

program.parse(process.argv);
