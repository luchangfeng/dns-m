### Intro
m-dns is a tool help you easy to manage your dns in MacOS system.

### Install
```bash
npm i -g m-dns
```

### Work Service
Workservice is your network interface name, you can look at it by command: `networksetup -listallnetworkservices`.

Before use dns, we should use `mdns select <workservicename>` to select the work service.


### Usage
You can use `mdns -h` to look at all commands.
`mdns select <workserviceName>`: select the work service, default service is "Wi-Fi"
`mdns ls`: list all available dns.
`mdns add <name> <dns>`: add one dns to list.
`mdns del <name>`: delete one dns from list.
`mdns use <name>`: use the specified dns, the system's dns will change to this value.
