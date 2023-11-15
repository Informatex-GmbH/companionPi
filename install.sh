#!/bin/sh

sudo apt update
sudo apt upgrade -y
sudo apt autoclean -y
sudo apt autoremove -y

# Disable HDMI on boot
sudo sed -i 's/exit 0/# Disable HDMI\n\/usr\/bin\/tvservice -o\n\nexit 0\n/g' /etc/rc.local

# Disable Splash-Screen
sudo sed -i 's/dtparam=audio=on/#dtparam=audio=on\n\n# Disable Splash-Screen\ndisable_splash=1/g' /boot/config.txt

# Remove Boot Messages
sudo sed -i 's/console=tty1/console=tty3/g' /boot/cmdline.txt
sudo sed -i 's/rootwait/rootwait quiet splash loglevel=0 logo.nologo vt.global_cursor_default=0/g' /boot/cmdline.txt
sudo sed -i 's/exit 0/# Suppress Kernel Messages\ndmesg --console-off\n\nexit 0\n/g' /etc/rc.local

# Webserver https://tutorials-raspberrypi.de/webserver-installation-apache2/
sudo apt install apache2 -y
sudo apt install php -y
sudo mv /home/pi/companionPi/web/* /var/www/html/

# Grant PHP sudo rights
sudo sed -i 's/#includedir \/etc\/sudoers.d/#includedir \/etc\/sudoers.d \n\n# Grant PHP sudo rights\nwww-data ALL=NOPASSWD: ALL/g' /etc/sudoers

# Kiosk-Mode https://die-antwort.eu/techblog/2017-12-setup-raspberry-pi-for-kiosk-mode/
sudo apt install xserver-xorg -y
sudo apt install x11-xserver-utils -y
sudo apt install xinit -y
sudo apt install openbox -y
sudo apt install chromium-browser -y
sudo apt install unclutter -y
sudo mv /home/pi/companionPi/scripts/autostart /etc/xdg/openbox/autostart
sudo printf '\n#Startx Automatically\nif [[ -z "$DISPLAY" ]] && [[ $(tty) = /dev/tty1 ]]; then\n. startx\nlogout\nfi' >> /home/pi/.profile

# Autologin
sudo ln -fs /lib/systemd/system/getty@.service /etc/systemd/system/getty.target.wants/getty@tty1.service
sudo mv /home/pi/companionPi/scripts/autologin.conf /etc/systemd/system/getty@tty1.service.d/autologin.conf

# WLAN aktivieren https://cryeffect.net/2020/05/03/wi-fi-is-currently-blocked-by-rfkill/
sudo rfkill list
sudo rfkill unblock 0

# Hotspot https://www.elektronik-kompendium.de/sites/raspberry-pi/2002171.htm
sudo apt install dnsmasq hostapd -y
sudo mv /home/pi/companionPi/scripts/dhcpcd.conf /etc/dhcpcd.conf
sudo chmod 600 /etc/dhcpcd.conf
sudo systemctl restart dhcpcd
sudo mv /home/pi/companionPi/scripts/dnsmasq.conf /etc/dnsmasq.conf
sudo chmod 600 /etc/dnsmasq.conf
sudo systemctl restart dnsmasq
sudo systemctl enable dnsmasq
sudo mv /home/pi/companionPi/scripts/hostapd.conf /etc/hostapd/hostapd.conf
sudo chmod 600 /etc/hostapd/hostapd.conf
sudo mv /home/pi/companionPi/scripts/hostapd /etc/default/hostapd
sudo systemctl unmask hostapd
sudo systemctl start hostapd
sudo systemctl enable hostapd
sudo mv /home/pi/companionPi/scripts/sysctl.conf /etc/sysctl.conf
sudo chmod 600 /etc/sysctl.conf
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"
sudo printf '\n\niptables-restore < \/etc\/iptables.ipv4.nat/g' >>  /etc/rc.local

# Auto DHCP https://drjohnstechtalk.com/blog/2018/01/multiple-ips-on-the-raspberry-pi/
sudo mv /home/pi/companionPi/scripts/ip.config /home/pi/ip.config
sudo chmod 777 /home/pi/ip.config
sudo mv /home/pi/companionPi/scripts/autodhcp.sh /home/pi/autodhcp.sh
sudo chmod +x /home/pi/autodhcp.sh
sudo printf '@reboot sudo ~/autodhcp.sh > ~/autodhcp.log 2>&1\n' | crontab -

# Companion https://github.com/bitfocus/companion/wiki/Manual-Install-on-Raspberry-Pi
#sudo apt install libgusb-dev git build-essential cmake libudev-dev libusb-1.0-0-dev curl -y
#curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
#sudo apt install nodejs -y
#sudo mv /home/pi/companionPi/scripts/50-companion.rules /etc/udev/rules.d/50-companion.rules
#sudo npm install yarn -g
#export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
#sudo su
curl https://raw.githubusercontent.com/bitfocus/companion-pi/main/install.sh | bash
sudo systemctl start companion

#git clone https://github.com/bitfocus/companion.git /home/pi/companion
#cd /home/pi/companion
#yarn update
#yarn build:writefile

#sudo mv /home/pi/companionPi/scripts/companion.service /etc/systemd/system/
#sudo chmod 644 /etc/systemd/system/companion.service
#sudo systemctl enable companion.service

sudo rm -r /home/pi/companionPi

sudo reboot
