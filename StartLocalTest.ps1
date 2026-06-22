param(
    [string] $HostName = "127.0.0.1",
    [int[]] $Ports = @(5173, 5174, 5175, 5180, 3000, 3001, 4173, 4174, 8000, 8080, 8090),
    [string] $BasePath = "/RoomAxioms/",
    [switch] $DryRun
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-PortAvailable {
    param([int] $Port)

    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($HostName), $Port)
    try {
        $listener.Start()
        return $true
    }
    catch {
        return $false
    }
    finally {
        $listener.Stop()
    }
}

function Select-Port {
    foreach ($port in $Ports) {
        if (Test-PortAvailable -Port $port) {
            return $port
        }
    }

    for ($port = 5200; $port -le 5299; $port++) {
        if (Test-PortAvailable -Port $port) {
            return $port
        }
    }

    throw "No available local test port found."
}

$Port = Select-Port
$Url = "http://$HostName`:$Port$BasePath"
$Command = "Set-Location -LiteralPath '$ProjectRoot'; if (-not (Test-Path -LiteralPath 'node_modules')) { pnpm install }; pnpm --filter @room-axioms/web dev -- --host $HostName --port $Port --strictPort"

if ($DryRun) {
    Write-Host "Project root: $ProjectRoot"
    Write-Host "Selected port: $Port"
    Write-Host "URL: $Url"
    Write-Host "Command: $Command"
    exit 0
}

Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    $Command
)

$Ready = $false
for ($attempt = 0; $attempt -lt 60; $attempt++) {
    Start-Sleep -Milliseconds 500
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
            $Ready = $true
            break
        }
    }
    catch {
        continue
    }
}

if (-not $Ready) {
    Write-Warning "The dev server did not answer at $Url yet. Opening the URL anyway."
}

Start-Process $Url

