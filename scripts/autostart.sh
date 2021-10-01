#!/bin/sh

#Chromium Startverzoegerung
sleep 1

/usr/bin/chromium-browser --kiosk --noerrdialogs --disable-session-crashed-bubble --disable-infobars --check-for-update-interval=604800 --disable-pinch --no-sandbox http://localhost/
