#!/bin/sh

sudo apt update
sudo apt upgrade -y
sudo apt autoclean -y
sudo apt autoremove -y

# Disable HDMI on boot
sudo sed -i 's/exit 0/# Disable HDMI\n\/usr\/bin\/tvservice -o\n\nexit 0\n/g' /etc/rc.local

# Disable Splash-Screen
sudo sed -i 's/dtparam=audio=on/#dtparam=audio=on\n\n# Disable Splash-Screen\ndisable_splash=1/g' /boot/firmware/config.txt

# Remove Boot Messages
sudo sed -i 's/console=tty1/console=tty3/g' /boot/firmware/cmdline.txt
sudo sed -i 's/rootwait/rootwait quiet splash loglevel=0 logo.nologo vt.global_cursor_default=0/g' /boot/firmware/cmdline.txt
sudo sed -i 's/exit 0/# Suppress Kernel Messages\ndmesg --console-off\n\nexit 0\n/g' /etc/rc.local

# Autologin
echo "[Service]" | sudo tee /etc/systemd/system/getty@tty1.service.d/autologin.conf
echo "ExecStart=-/sbin/agetty --autologin pi --noclear %I $TERM" | sudo tee -a /etc/systemd/system/getty@tty1.service.d/autologin.conf
sudo systemctl daemon-reload
sudo systemctl enable getty@tty1.service

# make ifconfig executable for anyone
sudo chmod 4755 /sbin/ifconfig

# Webserver
curl -sL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install nodejs -y
sudo npm install pm2 -g

sudo pm2 start companionPi/src/app.js
sudo pm2 startup
sudo pm2 save

# Kiosk-Mode https://blog.developbyter.com/raspberry-pi-os-lite-mit-kioskmodus-einrichten/
sudo apt install xserver-xorg-video-all -y
sudo apt install xserver-xorg-input-all -y
sudo apt install xserver-xorg-core -y
sudo apt install xinit -y
sudo apt install x11-xserver-utils -y

sudo apt install chromium-browser -y
sudo apt install unclutter -y

#echo "if [ -z $DISPLAY ] && [ $(tty) = /dev/tty1 ]\n      then\n          startx\n      fi" | sudo tee /home/pi/.bash_profile


sudo mv /home/pi/companionPi/install_files/.bash_profile /home/pi/.bash_profile
sudo mv /home/pi/companionPi/install_files/.xinitrc /home/pi/.xinitrc

# Companion https://user.bitfocus.io/docs/companion-pi
curl https://raw.githubusercontent.com/bitfocus/companion-pi/main/install.sh | bash
sudo systemctl start companion

sudo reboot
