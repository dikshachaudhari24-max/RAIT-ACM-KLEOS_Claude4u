# Running Hisably on Your Physical Phone

This guide gets the Hisably mobile app running on your real phone (Android or
iPhone) using Expo Go, connected to the backend running on your computer.

## Prerequisites

- Node.js installed on your computer
- Python 3.10+ installed (for the backend)
- Your phone and computer on the **same WiFi network**
- **Expo Go** app installed on your phone (Play Store / App Store)

---

## Step 1 — Find your computer's local IP

```bash
# Mac / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

You want the address that looks like `192.168.x.x` or `10.0.x.x`
(NOT `127.0.0.1`). Example: `192.168.1.42`.

---

## Step 2 — Point the app to your computer

Open `hisably/mobile/src/services/api.js` and set your IP:

```js
const LAN_IP = '192.168.1.42';   // <-- your computer's IP from Step 1
```

---

## Step 3 — Start the backend

```bash
cd hisably/backend
pip install -r requirements.txt      # first time only
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> The `--host 0.0.0.0` part is REQUIRED — it lets your phone reach the backend.
> Without it the server only listens on localhost and the phone can't connect.

Verify it works: open `http://<YOUR_IP>:8000/health` in your phone's browser.
You should see `{"status":"ok",...}`. If it doesn't load, see Troubleshooting.

---

## Step 4 — Start the mobile app

In a new terminal:

```bash
cd hisably/mobile
npm install            # first time only
npx expo start
```

A QR code appears in the terminal.

- **Android:** Open Expo Go → "Scan QR code" → scan it
- **iPhone:** Open the Camera app → point at the QR code → tap the banner

The app will bundle and open on your phone.

---

## Step 5 — Log in

1. Enter any 10-digit phone number
2. Tap "Send OTP"
3. In **development mode** the OTP pops up in an on-screen alert (e.g.
   "Dev OTP: 482910") — just type those 6 digits
4. You're in!

To receive the OTP on real WhatsApp instead, set `APP_ENV=production` in
`hisably/backend/.env` and configure your Twilio credentials there.

---

## Troubleshooting

**App loads but data/login fails ("Network request failed"):**
- Double-check `LAN_IP` matches your computer's current IP (it changes between
  networks).
- Make sure the backend was started with `--host 0.0.0.0`.
- Make sure phone + computer are on the SAME WiFi.
- Your computer's firewall may block port 8000 — allow it, or temporarily
  disable the firewall to test.

**Can't open `http://<IP>:8000/health` from the phone browser:**
- This confirms a network/firewall issue, not an app issue. Fix this first.

**QR code won't connect:**
- Run `npx expo start --tunnel` instead (slower but works across networks).
  Requires `npx expo install @expo/ngrok` the first time.

**"Expo Go SDK mismatch":**
- This project uses Expo SDK 52. Make sure your Expo Go app version supports
  SDK 52 (recent Expo Go versions do).
