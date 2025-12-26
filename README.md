# 📈 Stock Trading Calculator

A beautiful, modern web application that helps traders calculate risk management parameters for their stock trades. Built with vanilla JavaScript, HTML, and CSS.

## ✨ Features

### Input Parameters
- **Maximum Allowable Loss Amount** - Set your maximum dollar risk (saved automatically)
- **Entry Purchase Price** - Your planned entry price
- **Stop-Loss Price** - Your exit price to limit losses
- **Target Price** (Optional) - Your profit-taking target
- **Theme Toggle** - Switch between Light and Dark modes

### Calculated Results
- **Total Invested Capital** - Your total position size
- **Potential Gain %** - Expected percentage gain (when target is set)
- **Potential Gain** - Expected dollar profit (when target is set)
- **Risk/Reward Ratio** - Your risk-to-reward ratio
- **Stop-Loss %** - Your percentage loss at stop
- **Loss Amount** - Your maximum dollar loss

### Summary Display
Quick view showing Entry Price, Number of Shares, and Stop-Loss Price at a glance.

## 🎨 Design Highlights

- Clean, modern interface with intuitive two-column layout
- Real-time calculations as you type
- **Dark Mode Support** - Toggle between light and dark themes for comfortable viewing in any environment
- Professional color scheme with visual indicators:
  - Blue highlights for capital and favorable ratios
  - Green for potential profits
  - Red for losses and unfavorable ratios
- Fully responsive design (desktop, tablet, mobile)
- Smooth animations and transitions
- Smart input validation with helpful error messages

## 🚀 Getting Started

Simply open `index.html` in any modern web browser. No installation or build process required!

## 💡 How to Use

1. Enter your **Maximum Allowable Loss Amount** (this will be saved for next time)
2. Enter your **Entry Purchase Price**
3. Enter your **Stop-Loss Price** (must be less than entry price)
4. Optionally, enter your **Target Price** for profit calculations
5. View your calculated results in real-time

### Reset Options
- **Clear** - Reset all fields except Maximum Allowable Loss
- **Clear All** - Reset everything including saved Maximum Allowable Loss
- **Cancel** - Close the dialog without changes

## 🛠️ Technical Details

- **Pure Vanilla JavaScript** - No frameworks or dependencies
- **LocalStorage** - Persists Maximum Allowable Loss and Theme preference across sessions
- **Input Validation** - 
  - Positive numbers only
  - Stop-loss must be less than entry price
  - Target price must be greater than entry price
  - No leading zeros (except 0.xxx format)
- **Smart Calculations** - Rounds shares down to whole numbers
- **Responsive Grid** - 3-column layout that adapts to screen size

## 📱 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 📄 License

This project is open source and available for personal and commercial use.

## 👨‍💻 Author

William Pong

---

Built with ❤️ for traders who take risk management seriously.
