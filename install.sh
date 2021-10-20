sudo apt update
sudo apt upgrade -y
sudo apt autoclean -y
sudo apt autoremove

# WLAN aktivieren https://cryeffect.net/2020/05/03/wi-fi-is-currently-blocked-by-rfkill/
sudo rfkill list
sudo rfkill unblock 0

# Boot Messages entfernen
sudo sed -i 's/console=tty0/console=tty3/g' /boot/cmdline.txt
sudo sed -i 's/rootwait/rootwait quiet splash loglevel=0 logo.nologo vt.global_cursor_default=0/g' /boot/cmdline.txt
sudo sed -i 's/fi/fi\n\n#Suppress Kernel Messages\ndmesg --console-off/g' /etc/rc.local

# Bootbild
sudo sed -i 's/#dtoverlay=vc4-fkms-v3d/#dtoverlay=vc4-fkms-v3d\n\ndisable_splash=1/g' /boot/config.txt
sudo apt install fbi -y
sudo mv /home/pi/companionPi/scripts/splashscreen.service /etc/systemd/system/
sudo chmod 644 /etc/systemd/system/splashscreen.service
sudo systemctl enable splashscreen

# Companion https://github.com/bitfocus/companion/wiki/Manual-Install-on-Raspberry-Pi
sudo apt-get install libgusb-dev git build-essential cmake libudev-dev libusb-1.0-0-dev curl -y
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo mv /home/pi/companionPi/scripts/50-companion.rules /etc/udev/rules.d/50-companion.rules
sudo npm install yarn -g
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

git clone https://github.com/bitfocus/companion.git
cd companion
yarn update
./tools/build_writefile.sh

sudo mv /home/pi/companionPi/scripts/companion.service /etc/systemd/system/
sudo chmod 644 /etc/systemd/system/companion.service
sudo systemctl enable companion.service

# Webserver https://tutorials-raspberrypi.de/webserver-installation-apache2/
sudo apt install apache2 -y
sudo apt install php -y
sudo mv /home/pi/companionPi/web/* /var/www/html/

# Grant PHP sudo rights
sudo sed -i 's/#includedir \/etc\/sudoers.d/#includedir \/etc\/sudoers.d \n\n# Grant PHP sudo rights\nwww-data ALL=NOPASSWD: ALL/g' /etc/sudoers

# Kiosk-Mode https://itrig.de/index.php?/archives/2309-Raspberry-Pi-3-Kiosk-Chromium-Autostart-im-Vollbildmodus-einrichten.html
sudo apt install lxsession -y
sudo apt install chromium-browser -y
sudo apt install unclutter -y
sudo mv /home/pi/companionPi/scripts/autostart /home/pi/.config/lxsession/LXDE-pi/autostart
sudo mv /home/pi/companionPi/scripts/autostart.sh /home/pi/autostart.sh
sudo chmod +x /home/pi/autostart.sh

# Autologin
sudo systemctl set-default graphical.target
sudo sed -i 's/#autologin-user=/autologin-user=pi/g' /etc/lightdm/lightdm.conf
sudo ln -fs /lib/systemd/system/getty@.service /etc/systemd/system/getty.target.wants/getty@tty1.service
sudo mv /home/pi/companionPi/scripts/autologin.conf /etc/systemd/system/getty@tty1.service.d/autologin.conf

# Background ändern
sudo cp /home/pi/companionPi/logo.png /usr/share/lxde/wallpapers/logo.png
sudo sed -i 's/wallpaper=\/etc\/alternatives\/desktop-background/wallpaper=\/home\/pi\/companionPi\/logo.png/g' /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf

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
sudo sed -i 's/fi/fi\n\niptables-restore < \/etc\/iptables.ipv4.nat/g' /etc/rc.local


# Auto DHCP https://drjohnstechtalk.com/blog/2018/01/multiple-ips-on-the-raspberry-pi/
sudo mv /home/pi/companionPi/scripts/ip.config /home/pi/ip.config
sudo chmod 777 /home/pi/ip.config
sudo mv /home/pi/companionPi/scripts/autodhcp.sh /home/pi/autodhcp.sh
sudo chmod +x /home/pi/autodhcp.sh
sudo printf '@reboot sudo ~/autodhcp.sh > ~/autodhcp.log 2>&1' | crontab -

sudo reboot
