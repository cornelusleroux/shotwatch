# ShotWatch

*A simple, free, open-source shot timer. No ads, no tracking, no nonsense.*

This progressive web app allows you to record shooting sessions on a mobile phone.
It can be flexibly configured to use a combination of shot, time, or manual mark constraints to train for various scenarios.
Recorded sessions are saved to your device and can be downloaded afterwards.
All completely free.

> [!IMPORTANT]
> Although a best-effort attempt is made to detect shots accurately, with minimal delays and within display precision, performance depends on the processing power of your device, the quality of its microphone, and environmental factors.
> It is not intended for use in professional matches or as a replacement for commercial shot timers.


## Features

The app has the following core features:

- Microphone calibration to improve shot detection.
- Configurable start/end buzzer frequencies, durations, and random delays.
- Flexible session recording, which stops when the configured number of shots, time limit, number of manual markers, or a combination thereof, is reached.
- Session details show splits between filterable events.
- Session history, downloadable as a CSV.
- An embedded user guide.


## Installation

Go to [ShotWatch.app](https://shotwatch.app) and install the progressive web app in your browser.


## Project Support

If you enjoy this app, please consider supporting the project on [BuyMeACoffee](https://coff.ee/cornelusleroux).
Donations are greatly appreciated and help keep ShotWatch free and available to everyone.


## Contributing

Pull requests are welcome, although acceptance may be slow.
The app is considered feature-complete, so submitting only bug fixes or performance enhancements is preferable to keep it simple.

### Development Setup

- Run `bun start` to start up the bundler.
- Run `bun dev` to start the development server.
- Use `bun compile` to bundle the production version of assets.
- Use `bun set-version` to set the version in both the **package.json** and **manifest.json** files.

