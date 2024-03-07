#!/bin/bash
sleep 2
# see if there is a dhcp-assigned IP already. If so 'scope global' appears in the listing
#  ip add show eth0 sample output:
addflag=""
ipAddress=$(hostname --all-ip-addresses)
if [ -z "$ipAddress" ]; then
  addflag="add"
fi
# first IP
# ifconfig eth0 $addflag 192.168.0.10 netmask 255.255.255.0 broadcast 192.168.0.255

while read line; do ifconfig eth0 add $line netmask 255.255.255.0; done < ip.config

