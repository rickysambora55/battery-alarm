# Battery Alarm

An Electron application built with React to monitor battery levels and notify users when predefined charging thresholds are reached.

## Features

- **Real-time battery monitoring** – Tracks battery percentage and charging status.
- **Customizable alerts** – Set high and low battery level notifications.
- **Charging state notifications** – Alerts when the battery starts or stops charging.
- **Lightweight & background-friendly** – Runs efficiently with minimal resource usage.

## Download & Install

Get the latest release from the [Releases](https://github.com/rickysambora55/battery-alarm/releases) page.

## Project Setup

### Install Dependencies

Ensure you have [pnpm](https://pnpm.io/) installed, then run:

```bash
pnpm install
```

### Run in Development Mode

Start the application with hot-reloading:

```bash
pnpm run dev
```

### Build for Production

Generate an installable package for your platform. Currently tested only on Windows.

```bash
# For Windows
pnpm build:win

# For macOS
pnpm build:mac

# For Linux
pnpm build:linux
```

## Contributing

Feel free to submit issues or pull requests to improve this project.

## License

This project is licensed under the [MIT License](LICENSE).
