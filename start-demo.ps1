param(
  [int]$Port = 4173
)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue

if (-not $pythonCommand) {
  $pythonCommand = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $pythonCommand) {
  Write-Error '未找到 Python。请先安装 Python 3，或手动使用其他静态文件服务器。'
  exit 1
}

$ipv4 = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -notlike '127.*' -and
    $_.IPAddress -notlike '169.254*' -and
    $_.PrefixOrigin -ne 'WellKnown'
  } |
  Select-Object -First 1 -ExpandProperty IPAddress)

Write-Host ''
Write-Host "Lingxi is running on:" -ForegroundColor Cyan
Write-Host "  Local:   http://localhost:$Port" -ForegroundColor White
if ($ipv4) {
  Write-Host "  LAN:     http://$ipv4`:$Port" -ForegroundColor White
}
Write-Host ''
Write-Host '如果同一局域网设备仍然打不开，请检查：' -ForegroundColor DarkGray
Write-Host '1. 这个窗口是否一直保持运行' -ForegroundColor DarkGray
Write-Host '2. Windows 防火墙是否放行 Python' -ForegroundColor DarkGray
Write-Host '3. 访问设备是否和当前电脑在同一个 Wi-Fi / 局域网' -ForegroundColor DarkGray
Write-Host ''
Write-Host '按 Ctrl+C 可以停止服务。' -ForegroundColor DarkGray
Write-Host ''

Push-Location $scriptRoot
try {
  if ($pythonCommand.Name -eq 'py.exe' -or $pythonCommand.Name -eq 'py') {
    & $pythonCommand.Source -3 -m http.server $Port --bind 0.0.0.0
  } else {
    & $pythonCommand.Source -m http.server $Port --bind 0.0.0.0
  }
} finally {
  Pop-Location
}
