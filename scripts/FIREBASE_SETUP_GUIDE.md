# Firebase Push Notifications - Setup Guide
# ==========================================

## STEP 1: Firebase Project banao (5 min)

1. Browser me jao: https://console.firebase.google.com/
2. "Add project" / "Create a project" click karo
3. Project name: `shophub` (ya kuch bhi)
4. Analytics enable/disable karo (optional)
5. Create project → wait → Continue

## STEP 2: Web App add karo (2 min)

1. Project ke home page pe "</>" (Web) icon click karo
2. App nickname: `ShopHub Website`
3. "Also set up Firebase Hosting" → UNCHECK (nahi chahiye)
4. "Register app" click karo
5. **Ye dikhega — COPY KARO:**
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "shophub-xxxxx.firebaseapp.com",
     projectId: "shophub-xxxxx",
     storageBucket: "shophub-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc..."
   };
   ```

## STEP 3: Cloud Messaging enable karo (1 min)

1. Left menu → "Engagement" → "Cloud Messaging"
2. Agar "Enable" button aaye to click karo

## STEP 4: VAPID key generate karo (2 min)

1. Project Settings (gear icon) → General tab
2. Scroll down → "Your apps" → Web app pe click
3. "Cloud Messaging" tab
4. "Generate key pair" click karo
5. **Key copy karo** (starts with "BLq..." ya "BH...")

## STEP 5: Service Account key download karo (2 min)

1. Project Settings → "Service Accounts" tab
2. "Generate new private key" click karo
3. JSON file download hogi — KHOOLO MAT, bas rakho safe
4. JSON file kholo → 3 cheezein chahiye:
   - `project_id`
   - `client_email`
   - `private_key` (multi-line string)

## STEP 6: Setup script run karo

```powershell
# PowerShell me:
cd "C:\Users\jojo\Documents\full stack\ecommerce"
.\scripts\setup-firebase.ps1
```

Script tumse values maangega, phir Vercel + Render pe env vars set kar dega + redeploy trigger karega.
