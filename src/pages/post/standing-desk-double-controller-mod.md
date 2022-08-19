---
layout: ../../layouts/post.astro
title: Standing Desk Double Controller Mod
client: Self
publishDate: 2022-08-02 00:00:00
img: /assets/standing-desk-double-controller-mod/overview-ctrl-int-arduino-analyzer.jpg
description: |
  A splitter that connects an interface to two table leg motor controllers.
tags:
  - electronics
  - programming
---

## Goal

The goal of this project is to build and program a device to make two height adjustable desks move simultaneously with one interface. The two electric frames have to always be at the same height. I'm doing this project for my brother because he plans to weld two of those desk frames together for extra stability and lifting capacity.

The electric height-adjustable desk frames are from [Xantron](https://www.xantron.net/), which has it's origin in Switzerland.

<img alt="Table frame height adjustable black, EDS08-B" src="/assets/standing-desk-double-controller-mod/table-frame-height-adjustable-black-eds08-b.jpg">

## Teardown

### Controller

<div class="rowcontainer2x">
  <img alt="Controller Circuit Board Front" src="/assets/standing-desk-double-controller-mod/controller-circuit-board-front.jpg">
  <img alt="Controller Circuit Board Back" src="/assets/standing-desk-double-controller-mod/controller-circuit-board-back.jpg">
</div>

The controller consists a power supply, motor MOSFETs, a microcontroller and more.

### Interface

<div class="rowcontainer2x">
  <img alt="Interface Circuit Board Front" src="/assets/standing-desk-double-controller-mod/interface-circuit-board-front.jpg">
  <img alt="Interface Circuit Board Back" src="/assets/standing-desk-double-controller-mod/interface-circuit-board-back.jpg">
</div>

There are seven buttons and a 3 digit 7-segment display on the interface.

### Leg Motor

<div class="rowcontainer2x">
  <img alt="Leg Motor" src="/assets/standing-desk-double-controller-mod/leg-motor.jpg">
  <img alt="Leg Motor Closeup" src="/assets/standing-desk-double-controller-mod/leg-motor-closeup.jpg">
</div>

The leg is raised and lowered by the motor through a gearbox. The controller switches the motors and reads their angle through a Hall effect sensor.

## Reverse-engineering the Protocol

<div class="rowcontainer3x">
  <img alt="Logic Analyzer" src="/assets/standing-desk-double-controller-mod/logic-analyzer.jpg">
  <img alt="Interface connected to RJ45" src="/assets/standing-desk-double-controller-mod/overview-interface.jpg">
  <img alt="Markings on Controller RJ" src="/assets/standing-desk-double-controller-mod/controller-rj-markings.jpg">
</div>

1. A logic analyzer is highly recommended because it makes this way easier. I'm using [this device](https://www.aliexpress.com/item/4000190740610.html).

2. I connected the interface to the Arduino and logic analyzer using a RJ45 connector.

3. Thanks for leaving the pinout on the silkscreen. ;) Unfortunately, I couldn't figure out what KEY1 and KEY2 stands for.

### While no buttons are pressed

<img alt="Serial data the interface sends while no buttons are pressed" src="/assets/standing-desk-double-controller-mod/logic-int-tx-unpressed.png">

This is the serial data which the interface sends to the controller about every 12ms. I'm using the [Saleae Logic](https://www.saleae.com/downloads/) software to analyze the signal.

### While the M button is pressed

<img alt="Serial data the interface sends while the M button is pressed" src="/assets/standing-desk-double-controller-mod/logic-int-tx-pressed-m.png">

<p>This is the data sent while pressing the M button. Notice the third and the fifth byte changed. The value of the third byte (hex <code>0x01</code>) corresponds to binary <code>0000001</code>.</p>

### While the T button is pressed

<img alt="Serial data the interface sends while the T button is pressed" src="/assets/standing-desk-double-controller-mod/logic-int-tx-pressed-t.png">

<p>This is the data sent while pressing the T button. Notice the third and the fifth byte changed. The value of the third byte (hex <code>0x10</code>) corresponds to binary <code>0001000</code>.</p>

### While the M and T buttons are pressed

<img alt="Serial data the interface sends while the M and T buttons are pressed" src="/assets/standing-desk-double-controller-mod/logic-int-tx-pressed-mt.png">

<p>This is the data sent while pressing the M and T buttons. The value of the third byte (hex <code>0x11</code>) corresponds to binary <code>0001001</code>.<br>The fifth byte is most likely a checksum of every byte after the start byte (hex 0xA5).</p>

After a bit of trying, I determined these bitmasks:

<table>
  <tr>
      <th style="width: 5rem">Binary</th>
      <th style="width: 5rem">Hex</th>
      <th style="width: 5rem">Button</th>
  </tr>
  <tr>
      <td>00000001</td>
      <td>0x01</td>
      <td>M</td>
  </tr>
  <tr>
      <td>00000010</td>
      <td>0x02</td>
      <td>1</td>
  </tr>
  <tr>
      <td>00000100</td>
      <td>0x04</td>
      <td>2</td>
  </tr>
  <tr>
      <td>00001000</td>
      <td>0x08</td>
      <td>3</td>
  </tr>
  <tr>
      <td>00010000</td>
      <td>0x10</td>
      <td>T</td>
  </tr>
  <tr>
      <td>00100000</td>
      <td>0x20</td>
      <td>UP</td>
  </tr>
  <tr>
      <td>01000000</td>
      <td>0x40</td>
      <td>DOWN</td>
  </tr>
</table>

## Sending commands

### Connecting to the Arduino

<div class="rowcontainer2x">
  <img alt="Overview of Controller, Interface, Arduino and Analyzer" src="/assets/standing-desk-double-controller-mod/overview-ctrl-int-arduino-analyzer.jpg">
  <img alt="Arduino Mega 2650 Pro Mini" src="/assets/standing-desk-double-controller-mod/arduino-mega-2650-pro-mini.jpg">
</div>

1. The interface and controller are now connected to the Arduino's serial ports.

2. I'm using an [Arduino Mega 2650 Pro Mini](https://www.aliexpress.com/item/1005001632923624.html).

### Receiving, validating and handling Commands

#### Calculating Checksums

```cpp
uint8_t checkSum(uint8_t *cmdBytes, uint8_t cmdLen)
{
  uint16_t sum = 0;
  for (int i = 1; i < cmdLen - 1; i++)
    sum += cmdBytes[i];
  return (sum % (0xFF + 1));
}
```

#### Receiving and handling Commands

```cpp
void receiveCmd(uint8_t from, uint8_t cmdLen)
{
  HardwareSerial *inputSerial = getSerial(from);
  while ((*inputSerial).available() > 0)
  {
    uint8_t byte = (*inputSerial).peek();
    if (byte != (isCtrlSerial(from) ? PROT_INT_START : PROT_CTRL_START))
    {
      (*inputSerial).read();
      continue;
    }

    uint8_t *cmdBytes = new uint8_t[cmdLen];
    (*inputSerial).readBytes(cmdBytes, cmdLen);
    if (cmdBytes[cmdLen - 1] == checkSum(cmdBytes, cmdLen))
    {
      handleCmd(from, cmdBytes, cmdLen);
      return;
    }
  }
}
```

This C++ snippet receives and checks commands and calls the handler function if a command is received. You can find all this project's code on [this GitHub repository](https://github.com/silvio2402/deskcontrolsplit).

### Sending Commands

```cpp
struct intButtons
{
  bool pressedM;
  bool pressed1;
  bool pressed2;
  bool pressed3;
  bool pressedT;
  bool pressedUP;
  bool pressedDW;
};

void sendCtrlCmd01(uint8_t to, intButtons buttonStates)
{
  uint8_t state = 0;
  if (buttonStates.pressedM)
    state += PROT_CMD_CTRL_BUTTON_M;
  if (buttonStates.pressed1)
    state += PROT_CMD_CTRL_BUTTON_1;
  if (buttonStates.pressed2)
    state += PROT_CMD_CTRL_BUTTON_2;
  if (buttonStates.pressed3)
    state += PROT_CMD_CTRL_BUTTON_3;
  if (buttonStates.pressedT)
    state += PROT_CMD_CTRL_BUTTON_T;
  if (buttonStates.pressedUP)
    state += PROT_CMD_CTRL_BUTTON_UP;
  if (buttonStates.pressedDW)
    state += PROT_CMD_CTRL_BUTTON_DW;

  uint8_t cmdBytes[5] = {PROT_CTRL_START, 0x00, state, PROT_CMD_CTRL_BUTTONS};
  cmdBytes[4] = checkSum(cmdBytes, 5);
  sendCmd(to, cmdBytes, 5);
}
```

This function assembles and sends the command of which buttons are pressed to the controller.

#### Controller's Response

<img alt="Controller's Response" src="/assets/standing-desk-double-controller-mod/logic-ctrl-tx-response-e21.png">

You can see the command my code sent at the brown line. The orange line is the controller sending a response. I suspect the response contains which segment on the three 7-segment displays should light up.

Note that the data coming from the controller starts with 0x5A and not 0xA5 which is sent when a command from the interface is sent.

#### Playing back a Command to the Interface manually

```cpp
void sendIntCmd10(uint8_t to)
{
  uint8_t cmdBytes[6] = {PROT_INT_START, B01111001, B01011011, B00000110, PROT_CMD_INT_STATE};
  cmdBytes[5] = checkSum(cmdBytes, 6);
  sendCmd(to, cmdBytes, 6);
}
```

This function sends a command which the controller normally sends to the interface, which must be after a status update sent by the interface. I'm not certain of the parameters of this command yet so I'm just using the values which I saw in the analyzer.

<img alt="Interface displaying E21" src="/assets/standing-desk-double-controller-mod/interface-display-e21.jpg">

Just as hoped, the interface now displays the same thing displayed at the time I took the data. Hooray!

#### Parameters

To figure out what the parameters do, I'm going to try to change them slightly:

```cpp
// uint8_t cmdBytes[6] = {PROT_INT_START, B01111001, B01011011, B00000110, PROT_CMD_INT_STATE};
   uint8_t cmdBytes[6] = {PROT_INT_START, B01110110, B10110000, B00000000, PROT_CMD_INT_STATE};
```

Which results to HI.

<img alt="Interface displaying HI." src="/assets/standing-desk-double-controller-mod/interface-display-hi.jpg">

Nice! The first parameter byte defines the first digit, the second parameter byte the second digit, etc.. The least significant bit in each byte sets the segment A, the bit before that the segment B, etc.. The most significant bit sets the dot. For some reason, the display will not display if all the bits are set.

Here I've made a table of the bits corresponding to their segment:

<div class="rowcontainer2x justifycontentstart">
  <table>
    <tr>
        <th style="width: 5rem">Binary</th>
        <th style="width: 5rem">Hex</th>
        <th style="width: 5rem">Segment</th>
    </tr>
    <tr>
        <td><code>00000001</code></td>
        <td><code>0x01</code></td>
        <td><code>A</code></td>
    </tr>
    <tr>
        <td><code>00000010</code></td>
        <td><code>0x02</code></td>
        <td><code>B</code></td>
    </tr>
    <tr>
        <td><code>00000100</code></td>
        <td><code>0x04</code></td>
        <td><code>C</code></td>
    </tr>
    <tr>
        <td><code>00001000</code></td>
        <td><code>0x08</code></td>
        <td><code>D</code></td>
    </tr>
    <tr>
        <td><code>00010000</code></td>
        <td><code>0x10</code></td>
        <td><code>E</code></td>
    </tr>
    <tr>
        <td><code>00100000</code></td>
        <td><code>0x20</code></td>
        <td><code>F</code></td>
    </tr>
    <tr>
        <td><code>01000000</code></td>
        <td><code>0x40</code></td>
        <td><code>G</code></td>
    </tr>
    <tr>
        <td><code>10000000</code></td>
        <td><code>0x80</code></td>
        <td><code>DP</code></td>
    </tr>
  </table>
  <div>
    <img alt="7-Segment Display Segments" src="/assets/standing-desk-double-controller-mod/7-segment-display.png">
  </div>
</div>

## To be continued...
