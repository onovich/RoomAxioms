param(
    [string] $Url = "http://blog.onovich.com/RoomAxioms/",
    [switch] $DryRun
)

$ErrorActionPreference = "Stop"

if ($DryRun) {
    Write-Host "Online test URL: $Url"
    exit 0
}

Start-Process $Url
