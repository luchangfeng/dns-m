dns-m is a tool help you easy to manage your dns in MacOS system.

### Install
```bash
npm i -g @luchangfeng/dns-m
```

### Work Service
Workservice is your network interface name, you can look at it by command:
```bash
networksetup -listallnetworkservices
```

Before use dns, we should use `dm select <workservicename>` to select the work service.


### Usage
You can use `dm -h` to look at all commands.

`dm select <workserviceName>`: select the work service, default service is "Wi-Fi"

`dm ls`: list all available dns.

`dm add <name> <dns>`: add one dns to list.

`dm del <name>`: delete one dns from list.

`dm use <name>`: use the specified dns, the system's dns will change to this value.
