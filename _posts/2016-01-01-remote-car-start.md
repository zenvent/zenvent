---
layout: post
title: "Cellular Car Stater"
description: "How to wirelessly start your car using a text message with Arduino."
tags: [tutorial, electronics]
---

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/Fv8nzEdNOZs" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

I figured out a way to cheaply start my car using a text message. I wanted to be able to do this because my office is quite the distance from where I park, and my current remote starter has a range of only 20 feet or so. Learn how to do this yourself by click the link below or watching my video tutorial.

## Objective

Extend the range of my vehicle's auto-start using the cheapest solution I can think of. I would also like to keep vehicle modifications to a minimum (or none).

## Solution

Trigger the auto-start remote using an Arduino connected to a cell service. User will send an SMS message to the device, which will validate the message then trigger a relay which will cause the remote to send a signal and the car will start. The device will be left in the car and run off the vehicle's battery.

## Skills required

If you follow the tutorial, basic computer and electronics skills. I am assuming you can make connections using a bread board or soldering iron. I am also assuming your car already has a remote starter installed, and that you are willing to sacrifice one of the remotes.

## Required Materials

* [Arduino Uno $10](http://amzn.to/1RGPjgW)
* [Relay Module $5](link: http://amzn.to/1OL7vVJ)
* [GPRS Shield $30](http://amzn.to/1RGQb5j)
* [SIM Card: Ting or T-Mobile](https://ting.com/rates)
* [Breadboard & Wires (or solder)](http://amzn.to/1Nbx2C4)
* Car Start Remote Control

*This tutorial assumes you already have remote start on your car*

## Estimated Cost

Materials:  $45

SIM & Service:  $10 SIM Card + $6 monthly

Download Code: `https://github.com/zenvent/RemoteCarStart`

