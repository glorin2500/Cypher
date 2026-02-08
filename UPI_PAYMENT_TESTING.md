# UPI Payment Fix - Testing Guide

## What Was Fixed

### 1. **Added Validation** (`upi-handler.ts`)
- ✅ VPA format validation (must contain `@`)
- ✅ Amount validation (must be positive number)
- ✅ Default currency parameter (`cu=INR`)

### 2. **Proper UPI Handler Integration** (`overlays.tsx`)
- ✅ Uses `parseUPIString()` to parse original QR data
- ✅ Uses `attemptUPIRedirect()` for proper deep linking
- ✅ Adds currency parameter for all payments
- ✅ Error handling with user-friendly messages
- ✅ Clipboard fallback if redirect fails

### 3. **Debug Logging**
- ✅ Console logs show UPI string and parsed parameters
- ✅ Helps identify issues during testing

---

## How to Test

### Test 1: Scan Real UPI QR Code
1. Open the app in browser
2. Navigate to Scanner page
3. Scan a real merchant QR code (with amount)
4. Click "Proceed to Payment"
5. **Check browser console** for debug logs:
   ```
   🔍 Original UPI String: upi://pay?pa=merchant@paytm&pn=Store&am=100&cu=INR
   ✅ Parsed UPI Params: {pa: "merchant@paytm", pn: "Store", am: "100", cu: "INR"}
   ```
6. **Verify UPI app opens** with:
   - ✅ Correct merchant name
   - ✅ Correct amount
   - ✅ Currency shown as INR
7. **Complete the payment** in UPI app

### Test 2: Manual UPI Entry
1. Go to Manual Entry page
2. Enter a UPI ID (e.g., `merchant@paytm`)
3. Click "Verify"
4. Click "Proceed to Payment"
5. **Check console** for constructed UPI params
6. **Verify UPI app opens** with:
   - ✅ Correct UPI ID
   - ✅ Currency = INR
   - ✅ No amount (manual entry doesn't have amount)

### Test 3: Upload QR Image
1. Go to Upload page
2. Upload a QR code image
3. Click "Proceed to Payment"
4. **Verify same behavior** as Test 1

### Test 4: Error Handling
1. Try with invalid UPI ID (no `@` symbol)
2. **Should show error**: "Invalid UPI ID format - must contain @"
3. Try with negative amount
4. **Should show error**: "Invalid amount - must be a positive number"

---

## Expected Behavior

### ✅ Success Case
- UPI app opens immediately
- All payment details pre-filled correctly
- Payment can be completed successfully
- No errors in console

### ⚠️ Fallback Case
If UPI app doesn't open (rare):
- Alert shows: "UPI ID copied to clipboard!"
- User can manually open UPI app
- Paste UPI ID to complete payment

### ❌ Error Case
If something is wrong:
- Clear error message shown
- Console shows detailed error
- User can retry or use manual payment

---

## Debugging

If payment still fails, check console for:

1. **Original UPI String**
   ```
   🔍 Original UPI String: upi://pay?pa=...
   ```
   - Should be complete UPI URL
   - Should have `pa`, `pn`, `am`, `cu` parameters

2. **Parsed Parameters**
   ```
   ✅ Parsed UPI Params: {pa: "...", pn: "...", am: "...", cu: "INR"}
   ```
   - All fields should be present
   - Amount should be number (no symbols)
   - Currency should be "INR"

3. **Error Messages**
   ```
   ❌ Payment redirect failed: Invalid UPI ID format
   ```
   - Shows exactly what went wrong
   - Helps identify the issue

---

## Common Issues & Solutions

### Issue: UPI app doesn't open
**Solution**: Check if you're on HTTPS or localhost (required for deep links)

### Issue: Amount shows as 0 or missing
**Solution**: Check if QR code actually has amount parameter (`am`)

### Issue: Special characters in merchant name
**Solution**: Now handled by `URLSearchParams` (auto-encoded)

### Issue: Payment fails in UPI app
**Possible causes**:
- Invalid merchant VPA
- Insufficient balance
- UPI app-specific issue
- Network connectivity

---

## Next Steps

1. **Test with multiple UPI apps**:
   - Google Pay
   - PhonePe
   - Paytm
   - BHIM

2. **Test on mobile devices**:
   - Android Chrome
   - iOS Safari
   - In-app browsers

3. **Test edge cases**:
   - Very long merchant names
   - Special characters in names
   - Large amounts (₹10,000+)
   - Decimal amounts (₹99.50)

4. **Remove debug logs** after confirming everything works:
   ```typescript
   // Remove these lines from overlays.tsx:
   console.log('🔍 Original UPI String:', ...);
   console.log('✅ Parsed UPI Params:', ...);
   console.log('🔍 Constructing UPI from details:', ...);
   ```

---

## Success Criteria

- ✅ UPI app opens with correct details
- ✅ Payment completes successfully
- ✅ No console errors
- ✅ Works on mobile devices
- ✅ Works with different UPI apps
- ✅ Graceful error handling
