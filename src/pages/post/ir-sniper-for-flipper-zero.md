---
layout: ../../layouts/post.astro
title: IR Sniper for Flipper Zero
client: Self
publishDate: 2023-06-03 00:00:00
img: /assets/ir-sniper-for-flipper-zero/980nm-laser-module.jpg
description: |
  Developing an IR laser sniper for the Flipper Zero.
tags:
  - electronics
---

## Disclaimer

The use of high-power infrared lasers carries inherent risks due to their invisible nature, and should be operated with caution and appropriate safety measures. The blog writer disclaims any liability for any damage, injury, or harm that may result from the misuse or improper handling of such lasers. Readers are solely responsible for understanding and assuming the legality and risks associated with using these devices.

Don't even think about replicating this project. It's incredibly stupid and dangerous. If you do it anyway, please don't hurt anyone but yourself. The laser I chose is a class 4 laser, which is the most dangerous laser class. If you point this at your eyes even for just a split second, it will burn a hole right through your retina.

You have been warned.

## What is a Flipper Zero?

<img alt="Front view of white Flipper Zero" src="/assets/ir-sniper-for-flipper-zero/whiteFlatNew.svg">

> Flipper Zero is a portable multi-tool for pentesters and geeks in a toy-like body. It loves hacking digital stuff, such as radio protocols, access control systems, hardware and more. It's fully open-source and customizable, so you can extend it in whatever way you like.
>
> &mdash; <cite>Flipper Devices Inc</cite>

## Project Idea

The Flipper Zero has an IR transmitter and receiver, which can be used to control IR devices. Unfortunately, the IR transmitter lacks the power to control devices from a far distance, especially when the signal has to pass through windows. This project aims to solve this problem by adding an IR laser to the Flipper Zero.

My initial idea was to use [this](https://www.aliexpress.com/item/32978919099.html) IR laser engraving head which supports TTL (transistor-transistor-logic) modulation. There are however a couple of things to consider:

- Powering the laser
- Getting the correct wavelength laser
- Modulating the laser
- Aiming the laser
- Laser safety

### Powering the Laser

Since the Flipper Zero can't provide enough power to drive the laser, an external power source is required. The laser I chose requires 12V and 500mW. I decided to use two 18650 lithium batteries and the 12V, Type-C SMD variant of [this](https://www.aliexpress.com/item/1005002982442200.html) lithium battery charger/power supply module to power the laser, since it is portable and can provide 15W at 12V which is plenty and can charge the battery using a USB-C port.

<img alt="lithium battery charger/power supply module" src="/assets/ir-sniper-for-flipper-zero/lithium-battery-charger-power-supply-module.png">

[Great Scott](https://www.youtube.com/@greatscottlab) has recently made a video about [this](https://www.youtube.com/watch?v=6bicunweBAQ) module and concluded that its output has a lot of noise. Fortunately, he also found a solution to this problem in his video. I've slightly modified his solution to fit my needs:
Just replace both 220uF electrolytic capacitors with a pair of high-quality low-ESR (equivalent series resistance) solid aluminum capacitors. I used [these](https://www.aliexpress.com/item/1005003012986121.html) 270uF 16V capacitors.
This should reduce the noise to an acceptable level.

### Getting the Correct Wavelength Laser

Most IR remote-controlled devices use the IR wavelength of 940nm including the Flipper Zero. However, I couldn't find laser modules with this wavelength. The closest I could find was 980nm. To figure out if this wavelength would work, I took a look at the datasheet of a common IR receiver, the [TSOP4838](https://www.vishay.com/docs/82459/tsop48.pdf).

<img alt="Relative Spectral Sensitivity vs. Wavelength of TSOP4838" src="/assets/ir-sniper-for-flipper-zero/relative-spectral-sensitivity-vs-wavelength.png">

As you can see in the graph, the TSOP4838 has a sensitivity peak at 940nm, but at 980nm it still has &gt;90% sensitivity. This means that the 980nm laser should work fine.

<img alt="980nm laser module" src="/assets/ir-sniper-for-flipper-zero/980nm-laser-module.jpg">

I ended up choosing [this laser module](https://www.aliexpress.com/item/32978919099.html) which comes with a heatsink and a driver board. However, there are cheaper and lower power alternatives available like [this one](https://www.aliexpress.com/item/1005001880909909.html).

### Modulating the Laser

The laser module I chose supports TTL (transistor-transistor-logic) modulation. This means that the laser can be turned on and off by applying a voltage to the modulation pin. Johnathan Vail already described how he modified the firmware and got the Flipper Zero to output its IR signals on a GPIO pin in [this](https://volcano.newts.org/2022/06/08/flipper-weaponized-universal-tv-remote-ir-blaster/) blog post.

That sounds great, but can we use this to modulate the laser?
The TTL pin might not be able to switch the laser at high frequencies. Remote-controlled IR devices typically use a 38kHz carrier frequency. The only way for me to find out if the laser can be modulated at this frequency is to try it out.

### Aiming the Laser

It would be a really cool addition to attach a magnification scope to it. This would make it easier to aim the laser at the target. I found [this](https://www.aliexpress.com/item/1005005459046117.html) 4.5x magnification scope which should work fine. It is immensely **important** to put an infrared filter in front of the scope to protect your eyes from the laser. If you don't do this, you're almost guaranteed that the laser reflection will burn a hole right through your retina.

<img alt="4.5x magnification scope" src="/assets/ir-sniper-for-flipper-zero/4.5x-magnification-scope.jpg">

### Laser Safety

The laser I chose is a class 4 laser, which is the most dangerous laser class. Do not do this project. It is an incredibly stupid idea. Anyways...

For safety purposes, I also ordered [this](https://www.aliexpress.com/item/1005001995687981.html) toggle switch with a safety cover to turn the laser on and off.

It might also be a good idea to add a distance sensor to it to automatically turn it off when it is aimed at something too close.

## To be continued... (or not)
