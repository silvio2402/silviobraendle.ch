---
layout: ../../layouts/post.astro
title: Xbox Rechargeable Battery Teardown
client: Self
publishDate: 2023-06-04 00:00:00
img: /assets/xbox-rechargeable-battery/battery-thumbnail-back.jpg
description: |
  A teardown of the Xbox Rechargeable Battery.
tags:
  - electronics
  - hacking
---

## Teardown

<div class="rowcontainer2x">
  <img alt="Xbox Rechargeable Battery Teardown Front" src="/assets/xbox-rechargeable-battery/battery-teardown-front.jpg">
  <img alt="Xbox Rechargeable Battery Teardown Back" src="/assets/xbox-rechargeable-battery/battery-teardown-back.jpg">
</div>

<img alt="Xbox Rechargeable Battery Case" src="/assets/xbox-rechargeable-battery/battery-case.jpg">

## Notes

The main chip on the PCB is a [TI BQ2425](https://www.ti.com/lit/ds/symlink/bq24250.pdf):
<br>
**2A Single-Input I2C, Stand-Alone Switched-Mode Li-Ion Battery Charger With Power-Path Management**

This is the same chip used in the Xbox Adaptive Controller, Xbox Elite Series 2 Controller, and the Xbox One Rechargeable Battery Pack.

[RDC](https://acidmods.com/forum/index.php?action=profile;u=7933) posted pictures and schematics of the XB1 Rechargeable Battery Pack on [this Acidmods thread](https://acidmods.com/forum/index.php/topic,43204.0.html). His battery pack (Model 1556) is very similar my Xbox Rechargeable Battery (Model 1727), though not identical.

## To be continued...
