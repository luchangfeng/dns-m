### Intro
dns-m is a tool help you easy to manage your dns in MacOS system.

### Install
```bash
npm i -g dns-m
```

### Work Service
Workservice is your network interface name, you can look at it by command: `networksetup -listallnetworkservices`.

Before use dns, we should use `dnsm select <workservicename>` to select the work service.


### Usage
You can use `dnsm -h` to look at all commands.
`dnsm select <workserviceName>`: select the work service, default service is "Wi-Fi"
`dnsm ls`: list all available dns.
`dnsm add <name> <dns>`: add one dns to list.
`dnsm del <name>`: delete one dns from list.
`dnsm use <name>`: use the specified dns, the system's dns will change to this value.
