# Firebase Push Notifications Setup
# ===================================
# Ye script Vercel (website) aur Render (backend) pe Firebase env vars set karta hai
# Phir redeploy trigger karta hai

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Firebase Push Notifications Setup' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

# Firebase Push Notifications Setup
# ===================================
# Ye script Vercel (website) aur Render (backend) pe Firebase env vars set karta hai
# Phir redeploy trigger karta hai

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Firebase Push Notifications Setup' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

# --- Web App Config (from Firebase Console) ---
Write-Host 'STEP 1 - Web App Config (Firebase Console - Project Settings - General - Your apps):' -ForegroundColor Yellow
Write-Host ''
$apiKey       = Read-Host '  NEXT_PUBLIC_FIREBASE_API_KEY'
$authDomain   = Read-Host '  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
$projectId    = Read-Host '  NEXT_PUBLIC_FIREBASE_PROJECT_ID'
$senderId     = Read-Host '  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
$appId        = Read-Host '  NEXT_PUBLIC_FIREBASE_APP_ID'

# --- VAPID Key ---
Write-Host ''
Write-Host 'STEP 2 - VAPID Key (Firebase Console - Project Settings - Cloud Messaging - Web Push certificates):' -ForegroundColor Yellow
$vapidKey     = Read-Host '  NEXT_PUBLIC_FIREBASE_VAPID_KEY'

# --- Service Account JSON ---
Write-Host ''
Write-Host 'STEP 3 - Service Account JSON file path:' -ForegroundColor Yellow
Write-Host '  (Firebase Console - Project Settings - Service Accounts - Generate new private key - JSON download)' -ForegroundColor Gray
$saPath       = Read-Host '  Path to JSON file (e.g. C:\Users\jojo\Downloads\shophub-firebase-adminsdk.json)'

if (-not (Test-Path $saPath)) {
    Write-Host "  File not found: $saPath" -ForegroundColor Red
    exit 1
}

$sa = Get-Content $saPath -Raw | ConvertFrom-Json
$saProjectId   = $sa.project_id
$saClientEmail = $sa.client_email
$saPrivateKey  = $sa.private_key

Write-Host ''
Write-Host "  Service Account loaded for project: $saProjectId" -ForegroundColor Green
Write-Host "  Client Email: $saClientEmail" -ForegroundColor Green

# --- Verification ---
Write-Host ''
Write-Host 'STEP 4 - Verifying web config matches service account project_id...' -ForegroundColor Yellow
if ($projectId -ne $saProjectId) {
    Write-Host "  WARNING: Mismatch! Web=$projectId, SA=$saProjectId - must be same Firebase project." -ForegroundColor Red
    $ans = Read-Host '  Continue anyway? (yes/no)'
    if ($ans -ne 'yes') { exit 1 }
} else {
    Write-Host '  Match confirmed' -ForegroundColor Green
}

# --- Vercel token ---
Write-Host ''
Write-Host 'Vercel Personal Access Token needed (https://vercel.com/account/tokens):' -ForegroundColor Yellow
$vercelToken = $env:VERCEL_TOKEN
if (-not $vercelToken) {
    $secure = Read-Host '  Paste Vercel token' -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $vercelToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}
$vercelTeam  = 'team_Ej57iJG67rYzulwvH1zImArB'
$vercelProj  = 'prj_tIZ2mzcACosq8fhC7lIRSCHPagOT'

# --- Set env vars on Vercel ---
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Setting env vars on Vercel (website)...' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

$vercelVars = [ordered]@{
    'NEXT_PUBLIC_FIREBASE_API_KEY'              = $apiKey
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'          = $authDomain
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'           = $projectId
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'  = $senderId
    'NEXT_PUBLIC_FIREBASE_APP_ID'               = $appId
    'NEXT_PUBLIC_FIREBASE_VAPID_KEY'            = $vapidKey
}

foreach ($kv in $vercelVars.GetEnumerator()) {
    $body = @{ key = $kv.Key; value = $kv.Value; target = @('production', 'preview'); type = 'encrypted' } | ConvertTo-Json -Compress
    try {
        Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$vercelProj/env?teamId=$vercelTeam" -Method POST `
            -Headers @{ Authorization = "Bearer $vercelToken"; 'Content-Type' = 'application/json' } `
            -Body $body | Out-Null
        Write-Host "  $($kv.Key)" -ForegroundColor Green
    } catch {
        $errBody = $_.ErrorDetails.Message
        if ($errBody -match 'already exists') {
            Write-Host "  $($kv.Key) (already exists, skipping)" -ForegroundColor Yellow
        } else {
            Write-Host "  $($kv.Key) - $errBody" -ForegroundColor Red
        }
    }
}

# --- Update local .env files ---
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Updating local .env files...' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

$envLines = @(
    '# Firebase Web App (Public - used in browser)',
    "NEXT_PUBLIC_FIREBASE_API_KEY=$apiKey",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$authDomain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$projectId",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$senderId",
    "NEXT_PUBLIC_FIREBASE_APP_ID=$appId",
    "NEXT_PUBLIC_FIREBASE_VAPID_KEY=$vapidKey"
)
$envBlock = $envLines -join "`n"

$envPath = 'C:\Users\jojo\Documents\full stack\ecommerce\website\.env.local'
if (Test-Path $envPath) {
    $existing = Get-Content $envPath -Raw
    if ($existing -notmatch 'NEXT_PUBLIC_FIREBASE_API_KEY') {
        Add-Content -Path $envPath -Value "`n# Firebase`n$envBlock"
        Write-Host '  Added Firebase vars to website/.env.local' -ForegroundColor Green
    } else {
        Write-Host '  website/.env.local already has Firebase vars' -ForegroundColor Yellow
    }
} else {
    Set-Content -Path $envPath -Value $envBlock
    Write-Host '  Created website/.env.local with Firebase vars' -ForegroundColor Green
}

# --- Backend env file ---
$saPrivateKeyEscaped = $saPrivateKey.Replace('"', '""')
$backendLines = @(
    '',
    '# Firebase Admin (backend)',
    "FIREBASE_PROJECT_ID=$saProjectId",
    "FIREBASE_CLIENT_EMAIL=$saClientEmail",
    "FIREBASE_PRIVATE_KEY=`"$saPrivateKeyEscaped`""
)
$backendBlock = $backendLines -join "`n"

$backendEnvPath = 'C:\Users\jojo\Documents\full stack\ecommerce\backend\.env'
if (Test-Path $backendEnvPath) {
    $existingBackend = Get-Content $backendEnvPath -Raw
    if ($existingBackend -notmatch 'FIREBASE_PROJECT_ID') {
        Add-Content -Path $backendEnvPath -Value $backendBlock
        Write-Host '  Added Firebase Admin vars to backend/.env' -ForegroundColor Green
    } else {
        Write-Host '  backend/.env already has Firebase vars' -ForegroundColor Yellow
    }
}

# --- Save Service Account JSON for Render ---
$renderJsonPath = 'C:\Users\jojo\Documents\full stack\ecommerce\backend\firebase-service-account.json'
Copy-Item $saPath $renderJsonPath -Force
Write-Host '  Service Account JSON copied to backend/firebase-service-account.json' -ForegroundColor Green

# --- Trigger Vercel redeploy ---
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Triggering Vercel redeploy...' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

$body = @{ name = 'zyronce'; gitSource = @{ ref = 'master'; type = 'github' } } | ConvertTo-Json -Compress
try {
    $deploy = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments?teamId=$vercelTeam" -Method POST `
        -Headers @{ Authorization = "Bearer $vercelToken"; 'Content-Type' = 'application/json' } `
        -Body $body
    Write-Host "  Vercel deploy triggered: $($deploy.url)" -ForegroundColor Green
} catch {
    Write-Host "  Auto-deploy failed: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    Write-Host '  Redeploy manually on vercel.com - ecommerce-website - Deployments - Redeploy' -ForegroundColor Yellow
}

# --- Render instructions ---
Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' RENDER SETUP (manual step required)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Ye vars Render dashboard me manually add karo:' -ForegroundColor Yellow
Write-Host ''
Write-Host '  1. https://dashboard.render.com - apna service select karo' -ForegroundColor White
Write-Host '  2. Environment tab - Add Environment Variable:' -ForegroundColor White
Write-Host ''
Write-Host "     FIREBASE_PROJECT_ID=$saProjectId" -ForegroundColor Cyan
Write-Host "     FIREBASE_CLIENT_EMAIL=$saClientEmail" -ForegroundColor Cyan
Write-Host '     FIREBASE_PRIVATE_KEY=<poora private key, dollar sign escape karke>' -ForegroundColor Cyan
Write-Host ''
Write-Host '  3. Save - Manual Deploy trigger karo' -ForegroundColor White
Write-Host ''
Write-Host '========================================' -ForegroundColor Green
Write-Host ' SETUP COMPLETE!' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
Write-Host 'Next steps:' -ForegroundColor Yellow
Write-Host '  1. Vercel pe auto-deploy complete hone do (~1-2 min)' -ForegroundColor White
Write-Host '  2. Render pe env vars add karke redeploy karo' -ForegroundColor White
Write-Host '  3. Browser me site kholo - Notification permission allow karo' -ForegroundColor White
Write-Host '  4. Admin panel se order update karo - user ko notification aana chahiye' -ForegroundColor White
Write-Host ''
