#!/bin/bash
sleep 5
# see if there is a dhcp-assigned IP already. If so 'scope global' appears in the listing
#  ip add show eth0 sample output:
addflag=""
ip add show eth0|grep -q 'scope global'
if [ $? == 0 ]; then
  addflag="add"
fi
# first IP
ifconfig eth0 $addflag 192.168.0.10 netmask 255.255.255.0 broadcast 192.168.0.255

while read line; do ifconfig eth0 add $line netmask 255.255.255.0; done < ip.config

