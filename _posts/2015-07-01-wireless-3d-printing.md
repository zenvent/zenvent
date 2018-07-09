---
layout: post
title: "3D Print Wirelessly"
excerpt: "How to use your 3D printer wirelessly"
tags: [tutorial, software]
image: "/images/octoprint-600x400.png"
---


Ever since flashing my Davinci 1.0 I have desired to move the printer away from my main computer. The 'music' from the servos was beginning to become annoying. Not only that but I wanted to printer to function on its own, and be accessible via the internet.

Lo and behold others have desired this too, a guy named Guy Sheffer started a project called OctoPi, which allows you to do just about everything using a cheap raspberry Pi. I use the setup in the instructions below for both my Davinci 1.0 and Fabrikator Mini 1.5.

## Materials: 

* Raspberry Pi (any model, 2 will be faster)
* SDHC Card (4GB+ Class 10)
* USB Wireless Card
* USB Wall Power Supply
* 3D Printer
* **(Optional, Webcam)**

## Download: 

OctoPi - <http://octoprint.org/download/>

Disk Imager - <http://sourceforge.net/projects/win32diskimager/>

PuTTY - <http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html>

Cura (15.04.2) - <https://ultimaker.com/en/products/cura-software/list>



In my tutorial I will show you how to setup for both of the 3D printers I have, though the process should be similar with most printers.


## Setup OctoPi on the SD card


Unzip the image and install the '.img' file using Disk Imager.
Open the SD card and edit "octopi-network.txt", enter your network SSID and password.
Insert the SD card into your Raspberry Pi, as well as plug in your USB WiFi and 3D printer.


## Setup OctoPi on the Raspberry Pi

Power up the Pi!
Log into your Pi via SSH, I recommend Putty. Default username and password is "pi" and "raspberry" Note: You can type "passwd" to change your admin password for your pi
Allow OctoPrint to use the entire SD card by running "sudo raspi-config" and select "Expand File System" (top option).
Reboot your Pi!

You should now be able to log into OctoPi by typing "http://octopi.local" or "http://<ipaddress>" into your browser.


## Configure OctoPrint

The Pi is almost ready to control your printer, but first you need to configure your setup. There are two ways you can use OctoPrint, either as a slicer and printer, or just as a printer. Meaning you can upload files to slice and print, or you can slice 3D models on your PC first then upload them to be printed. You will have more control on your PC with slicing.

Copy the settings in the images below (for your printer) to configure OctoPrint. Once you have done this, you are ready to print sliced files! If you'd like to be able to upload 3D models and slice them on OctoPrint, proceed to the next step as well.


## Configure Cura for your PC and OctoPrint (Optional)

OctoPrint comes with the Cura slicer already installed, to configure it you must first setup and install Cura on your PC. Once you have done that you can export the configuration (.ini) file and upload it to OctoPi. You only need to do this if you want to be able to slice with OctoPrint.

Install Cura.
Configure it using settings for your machine (described below).
Navigate to "File" and click "Save Profile" in Cura. Save the .ini somewhere easy to get to.
Go back to your browser and connect to your OctoPi server.
Click OctoPrint Settings, and at the bottom you'll see a Cura option.
On the Cura options panel, select "Import Profile" and choose the .ini file you made earlier.
You're done!
If you upload a 3D model, select this profile to slice your model. You can upload multiple profiles (maybe different fill densities, supports and so on) to use.

TinyBoy Fabrikator Mini 3D Printer Settings
Click the images below to see my Fabrikator Mini cura settings.