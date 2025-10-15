# 💰 Token Portfolio — React + Vite + Redux

![Token Portfolio Preview](https://opfjwckyarxymdkzuwdk.supabase.co/storage/v1/object/public/temp-blue-bnb/token.png)

---

## 🌍 Live Demo

🔗 **Live Project:** [https://crypto-dashboard-taupe-theta.vercel.app/](https://crypto-dashboard-taupe-theta.vercel.app/)

---

## 🧩 About the Project

**Token Portfolio** is a sleek and interactive web application that lets users track their cryptocurrency holdings, monitor live token prices, and manage a personalized watchlist — all in one clean, responsive interface.

The app displays your **total portfolio value** along with a **beautiful donut chart breakdown** of your assets. You can easily **add tokens**, **edit holdings**, and **refresh token prices** in real time.

---

## 🚀 Features

### 💼 Portfolio Overview

- Displays **total portfolio value** and a **donut chart** for visual breakdown.
- Includes a “**Last Updated**” timestamp for live data refresh.
- Fully responsive — matches the **Figma design pixel-perfectly**.

### 👀 Watchlist

- Add your favorite tokens to a personal **watchlist**.
- Displays token **price**, **24h % change** (with red/green indicators), **sparkline chart**, **holdings**, and **value**.
- Supports **infinite scrolling** while searching tokens (via CoinGecko API).
- Persistent **local storage** — your tokens stay saved even after reload.

### 🔄 Token Management

- **Add Token** button opens a modal with searchable, infinitely scrolling token list.
- Trending tokens section included.
- **Refresh Prices** button fetches live prices instantly using CoinGecko API.

### 🔐 Wallet Connection

- Integrated **Wagmi** and **RainbowKit** for seamless wallet connection.
- Displays connected wallet address in the header.
- Portfolio and watchlist remain synced after reconnecting.

---

## ⚙️ Tech Stack

| Category           | Technology                              |
| ------------------ | --------------------------------------- |
| Frontend Framework | **React + Vite**                        |
| Styling            | **Tailwind CSS**                        |
| State Management   | **Redux Toolkit**                       |
| API Data Fetching  | **TanStack Query (React Query)**        |
| Wallet Integration | **Wagmi + RainbowKit**                  |
| Data Source        | **CoinGecko API**                       |
| Persistence        | **Local Storage**                       |
| Charting           | **Donut Chart (Custom Implementation)** |

---

## 🧠 Technical Highlights

- 🔁 **Reusable components** (Buttons, Modals, Inputs) for scalability.
- 🎨 **Pixel-perfect design** based on Figma.
- ⚡ **Optimized API calls** with caching via **TanStack Query**.
- 🧹 **Clean architecture** — clear logic separation and folder structure.
- 💾 **Persistent watchlist** stored locally.
- 📈 **Real-time price updates** with smooth transitions.
- 🧠 **Utility functions** for clean CoinGecko API handling.
- 🔑 Uses a **demo CoinGecko API key** for fetching live token data.

---

## 🖋️ Design Reference

🎨 **Figma File:** [View Design Here](https://www.figma.com/design/ICYVun3vhMh7nIHzMGUqdw/Token-Portfolio?node-id=0-1&p=f&t=PMbRHAZfRdMSztS3-0)

---

## 🧭 How It Works

1. Connect your crypto wallet using **Wagmi + RainbowKit**.
2. Add your favorite tokens to your **Watchlist**.
3. Input your **holdings** for each token.
4. View your **total portfolio value** and a **donut chart** representation.
5. Use **Refresh Prices** to update all token prices instantly.
6. All token prices and metadata are fetched from **CoinGecko API** via custom utilities.

---

## 🧱 Project Setup

```bash
# Clone the repository
git clone https://github.com/sharmashiv24251/crypto-dashboard

# Navigate to project directory
cd crypto-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🧑‍💻 About the Developer

Built with ❤️ by **[Shivansh Sharma](https://www.linkedin.com/in/sharmashiv24251/)**
Front-end developer passionate about clean UI, efficient state management, and building pixel-perfect interfaces.

- 🌐 **GitHub:** [https://github.com/sharmashiv24251](https://github.com/sharmashiv24251)
- 🎨 **Figma:** [Token Portfolio Design](https://www.figma.com/design/ICYVun3vhMh7nIHzMGUqdw/Token-Portfolio?node-id=0-1&p=f&t=PMbRHAZfRdMSztS3-0)

---

## 📜 License

This project is for educational and demonstration purposes only.
