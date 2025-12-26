/**
 * Stock Trading Calculator
 * Handles all logic for the stock trading calculator application.
 */

// --- Constants ---
const MAX_LOSS_STORAGE_KEY = 'stockTradingCalc_maxLoss';
const CLASS_ERROR = 'error';
const CLASS_UPDATED = 'updated';
const CLASS_LOADING = 'loading';

const ALLOWED_KEYS = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
const REGEX_NUMERIC = /^[0-9]*\.?[0-9]*$/;

// --- DOM Elements ---
const inputs = {
    entryPrice: document.getElementById('entryPrice'),
    maxLoss: document.getElementById('maxLoss'),
    stopLoss: document.getElementById('stopLoss'),
    targetPrice: document.getElementById('targetPrice')
};

const errors = {
    entryPrice: document.getElementById('entryPriceError'),
    maxLoss: document.getElementById('maxLossError'),
    stopLoss: document.getElementById('stopLossError'),
    targetPrice: document.getElementById('targetPriceError')
};

const displays = {
    stopLossPercentage: document.getElementById('stopLossPercentage'),
    totalCapital: document.getElementById('totalCapital'),
    lossAmount: document.getElementById('lossAmount'),
    riskRewardRatio: document.getElementById('riskRewardRatio'),
    potentialProfit: document.getElementById('potentialProfit'),
    potentialGainPercentage: document.getElementById('potentialGainPercentage')
};

const cards = {
    riskReward: document.getElementById('riskRewardCard'),
    potentialProfit: document.getElementById('potentialProfitCard'),
    potentialGainPercentage: document.getElementById('potentialGainPercentageCard')
};

const summary = {
    container: document.getElementById('tradeSummary'),
    entryPrice: document.getElementById('summaryEntryPrice'),
    shares: document.getElementById('summaryShares'),
    stopLoss: document.getElementById('summaryStopLoss')
};

const ui = {
    resetButton: document.getElementById('resetButton'),
    resetDialog: document.getElementById('resetDialog'),
    dialogOverlay: document.getElementById('dialogOverlay'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    clearBtn: document.getElementById('clearBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    tradingForm: document.getElementById('tradingForm')
};

// --- State Management ---

function loadSavedMaxLoss() {
    const savedMaxLoss = localStorage.getItem(MAX_LOSS_STORAGE_KEY);
    if (savedMaxLoss) {
        inputs.maxLoss.value = savedMaxLoss;
    }
}

function saveMaxLoss() {
    const maxLoss = inputs.maxLoss.value;
    if (maxLoss && !isNaN(parseFloat(maxLoss)) && parseFloat(maxLoss) > 0) {
        localStorage.setItem(MAX_LOSS_STORAGE_KEY, maxLoss);
    }
}

// --- Formatting Helpers ---

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(value);

const formatNumber = (value, decimals = 2) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
}).format(value);

const formatPercentage = (value) => value.toFixed(2) + '%';

// --- Validation Logic ---

function clearErrors() {
    Object.values(errors).forEach(el => el.textContent = '');
    Object.values(inputs).forEach(el => el.classList.remove(CLASS_ERROR));
}

function validateInputs(values) {
    let isValid = true;
    clearErrors();

    // Helper to set error
    const setError = (key, message) => {
        errors[key].textContent = message;
        inputs[key].classList.add(CLASS_ERROR);
        isValid = false;
    };

    // Validate Entry Price
    if (isNaN(values.entryPrice) || values.entryPrice <= 0) {
        setError('entryPrice', 'Please enter a valid positive price');
    }

    // Validate Max Loss
    if (isNaN(values.maxLoss) || values.maxLoss <= 0) {
        setError('maxLoss', 'Please enter a valid positive amount');
    }

    // Validate Stop Loss
    if (isNaN(values.stopLoss) || values.stopLoss <= 0) {
        setError('stopLoss', 'Please enter a valid positive price');
    } else if (values.stopLoss >= values.entryPrice) {
        setError('stopLoss', 'Stop-loss must be less than entry price');
    }

    // Validate Target Price (Optional)
    if (inputs.targetPrice.value && !isNaN(values.targetPrice)) {
        if (values.targetPrice <= 0) {
            setError('targetPrice', 'Please enter a valid positive price');
        } else if (values.targetPrice <= values.entryPrice) {
            setError('targetPrice', 'Target price must be greater than entry price');
        }
    }

    return isValid;
}

function handleInput(event) {
    const input = event.target;
    let value = input.value;
    const originalValue = value;
    const cursorPosition = input.selectionStart;

    // 1. Allow only numbers and one dot
    // Remove any character that is not a digit or dot
    value = value.replace(/[^0-9.]/g, '');

    // 2. Ensure only one dot
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    // 3. Handle leading zeros
    // If value starts with 0 and has more digits and next char is not dot, remove leading 0
    if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
        value = value.replace(/^0+/, '');
        if (value === '' || value.startsWith('.')) {
            value = '0' + value;
        }
    }

    // 4. Update input if value changed
    if (value !== originalValue) {
        input.value = value;
        
        // Adjust cursor position
        // If we removed characters, try to keep cursor relative to where it was
        const lengthDiff = originalValue.length - value.length;
        const newCursorPos = Math.max(0, cursorPosition - lengthDiff);
        input.setSelectionRange(newCursorPos, newCursorPos);
    }
}

// --- Calculation Logic ---

function calculateTradingValues({ entryPrice, maxLoss, stopLoss, targetPrice }) {
    const stopLossPercentage = ((entryPrice - stopLoss) / entryPrice) * 100;
    const pricePerShareRisk = entryPrice - stopLoss;
    const numberOfShares = Math.floor(maxLoss / pricePerShareRisk);
    const totalCapital = entryPrice * numberOfShares;
    const lossAmount = (entryPrice - stopLoss) * numberOfShares;

    let riskRewardRatio = null;
    let potentialProfitAmount = null;
    let potentialGainPercentage = null;

    if (targetPrice && !isNaN(targetPrice) && targetPrice > entryPrice) {
        const potentialGain = targetPrice - entryPrice;
        const potentialLoss = entryPrice - stopLoss;
        riskRewardRatio = potentialGain / potentialLoss;
        potentialProfitAmount = potentialGain * numberOfShares;
        potentialGainPercentage = (potentialGain / entryPrice) * 100;
    }

    return {
        entryPrice,
        stopLoss,
        stopLossPercentage,
        numberOfShares,
        totalCapital,
        lossAmount,
        riskRewardRatio,
        potentialProfitAmount,
        potentialGainPercentage
    };
}

function updateUI(results) {
    const updateElement = (el, val) => {
        el.classList.add(CLASS_UPDATED);
        el.textContent = val;
        setTimeout(() => el.classList.remove(CLASS_UPDATED), 500);
    };

    updateElement(displays.stopLossPercentage, formatPercentage(results.stopLossPercentage));
    updateElement(displays.totalCapital, formatCurrency(results.totalCapital));
    updateElement(displays.lossAmount, formatCurrency(results.lossAmount));

    // Update Summary Section
    summary.container.style.display = 'flex';
    updateElement(summary.entryPrice, formatCurrency(results.entryPrice));
    updateElement(summary.shares, formatNumber(results.numberOfShares, 0));
    updateElement(summary.stopLoss, formatCurrency(results.stopLoss));

    if (results.riskRewardRatio !== null) {
        updateElement(displays.riskRewardRatio, '1:' + results.riskRewardRatio.toFixed(2));
        
        // Color logic for Risk/Reward Ratio
        if (results.riskRewardRatio > 1) {
            cards.riskReward.classList.add('highlight');
            cards.riskReward.classList.remove('loss');
        } else {
            cards.riskReward.classList.add('loss');
            cards.riskReward.classList.remove('highlight');
        }

        updateElement(displays.potentialProfit, formatCurrency(results.potentialProfitAmount));
        updateElement(displays.potentialGainPercentage, formatPercentage(results.potentialGainPercentage));
        cards.riskReward.style.display = 'block';
        cards.potentialProfit.style.display = 'block';
        cards.potentialGainPercentage.style.display = 'block';
    } else {
        cards.riskReward.style.display = 'none';
        cards.potentialProfit.style.display = 'none';
        cards.potentialGainPercentage.style.display = 'none';
        cards.riskReward.classList.remove('highlight', 'loss');
    }
}

function resetResults() {
    Object.values(displays).forEach(el => el.innerHTML = '<span class="loading">—</span>');
    cards.riskReward.style.display = 'none';
    cards.potentialProfit.style.display = 'none';
    cards.potentialGainPercentage.style.display = 'none';
    summary.container.style.display = 'none';
}

function handleCalculation() {
    const values = {
        entryPrice: parseFloat(inputs.entryPrice.value),
        maxLoss: parseFloat(inputs.maxLoss.value),
        stopLoss: parseFloat(inputs.stopLoss.value),
        targetPrice: parseFloat(inputs.targetPrice.value)
    };

    if (validateInputs(values)) {
        const results = calculateTradingValues(values);
        updateUI(results);
    } else {
        resetResults();
    }
}

// --- Dialog & Reset Logic ---

function showResetDialog() {
    ui.resetDialog.style.display = 'block';
    ui.dialogOverlay.style.display = 'block';
}

function hideResetDialog() {
    ui.resetDialog.style.display = 'none';
    ui.dialogOverlay.style.display = 'none';
}

function clearFields(keepMaxLoss = false) {
    inputs.entryPrice.value = '';
    inputs.stopLoss.value = '';
    inputs.targetPrice.value = '';
    
    if (!keepMaxLoss) {
        inputs.maxLoss.value = '';
        localStorage.removeItem(MAX_LOSS_STORAGE_KEY);
    }

    clearErrors();
    resetResults();
    hideResetDialog();
    
    // Focus on maxLoss if cleared, otherwise focus on entryPrice
    if (!keepMaxLoss) {
        inputs.maxLoss.focus();
    } else {
        inputs.entryPrice.focus();
    }
}

// --- Initialization & Event Listeners ---

function init() {
    loadSavedMaxLoss();

    // Input Event Listeners
    Object.entries(inputs).forEach(([key, input]) => {
        // Real-time calculation and validation
        input.addEventListener('input', (e) => {
            handleInput(e);
            handleCalculation();
            if (key === 'maxLoss') saveMaxLoss();
        });

        // Validation on blur
        input.addEventListener('blur', handleCalculation);
    });

    // Form Submission
    ui.tradingForm.addEventListener('submit', (e) => e.preventDefault());

    // Reset Button
    ui.resetButton.addEventListener('click', showResetDialog);

    // Dialog Buttons
    ui.clearAllBtn.addEventListener('click', () => clearFields(false));
    ui.clearBtn.addEventListener('click', () => clearFields(true));
    ui.cancelBtn.addEventListener('click', hideResetDialog);
    ui.dialogOverlay.addEventListener('click', hideResetDialog);

    // Tooltip Accessibility
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.setAttribute('role', 'button');
        tooltip.setAttribute('aria-label', tooltip.getAttribute('data-tooltip'));
    });

    console.log('Stock Trading Calculator initialized');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
