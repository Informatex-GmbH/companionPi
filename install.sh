sudo apt update
sudo apt upgrade -y
sudo apt autoclean -y
sudo apt autoremove

# Companion https://github.com/bitfocus/companion/wiki/Manual-Install-on-Raspberry-Pi
sudo apt-get install libgusb-dev git build-essential cmake libudev-dev libusb-1.0-0-dev curl -y
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo mv scripts/50-companion.rules /etc/udev/rules.d/50-companion.rules
sudo npm install yarn -g
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

git clone https://github.com/bitfocus/companion.git
cd companion
yarn update
./tools/build_writefile.sh

# Webserver https://tutorials-raspberrypi.de/webserver-installation-apache2/
sudo apt install apache2 -y
sudo apt install php -y
sudo mv web/* /var/www/html/

# Kiosk-Mode https://itrig.de/index.php?/archives/2309-Raspberry-Pi-3-Kiosk-Chromium-Autostart-im-Vollbildmodus-einrichten.html
sudo apt install lxsession -y
sudo apt install chromium-browser -y
sudo apt install unclutter -y
sudo mv scripts/autostart /etc/xdg/lxsession/LXDE/autostart
sudo mv scripts/autostart.sh /home/pi/autostart.sh

# Hotspot https://www.elektronik-kompendium.de/sites/raspberry-pi/2002171.htm
sudo apt install dnsmasq hostapd -y
sudo mv scripts/dhcpcd.conf /etc/dhcpcd.conf
sudo systemctl restart dhcpcd
sudo mv scripts/dnsmasq.conf /etc/dnsmasq.conf
sudo systemctl restart dnsmasq
sudo systemctl enable dnsmasq
sudo mv scripts/hostapd.conf /etc/hostapd/hostapd.conf
sudo chmod 600 /etc/hostapd/hostapd.conf
sudo mv scripts/hostapd /etc/default/hostapd
sudo systemctl unmask hostapd
sudo systemctl start hostapd
sudo systemctl enable hostapd
sudo mv scripts/sysctl.conf /etc/sysctl.conf
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"
sudo nano /etc/rc.local
iptables-restore < /etc/iptables.ipv4.nat

# Auto DHCP https://drjohnstechtalk.com/blog/2018/01/multiple-ips-on-the-raspberry-pi/
sudo printf '@reboot sudo ~/autodhcp.sh > ~/autodhcp.log 2>&1' | crontab -

sudo reboot
