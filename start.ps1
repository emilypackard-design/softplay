# softplay dev server starter
# Run this whenever you need to start or restart the app

$line = Get-Content "$PSScriptRoot\.env.local" | Where-Object { $_ -match "^ANTHROPIC_API_KEY=" }
$env:ANTHROPIC_API_KEY = ($line -split "=", 2)[1].Trim()
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "Starting softplay..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
& "C:\Program Files\nodejs\npm.cmd" run dev
