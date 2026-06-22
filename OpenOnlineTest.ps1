param(
    [string] $Url = "https://onovich.github.io/RoomAxioms/",
    [switch] $DryRun
)

$ErrorActionPreference = "Stop"

if ($DryRun) {
    Write-Host "Online test URL: $Url"
    exit 0
}

Start-Process $Url

