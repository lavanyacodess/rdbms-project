param(
  [ValidateSet('start', 'stop', 'restart', 'status')]
  [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'

$base = if ($env:CAMPUSCONNECT_MYSQL_HOME) {
  $env:CAMPUSCONNECT_MYSQL_HOME
} else {
  Join-Path $env:LOCALAPPDATA 'CampusConnect'
}

$mysqld = Join-Path $base 'mysql\bin\mysqld.exe'
$mysqladmin = Join-Path $base 'mysql\bin\mysqladmin.exe'
$myini = Join-Path $base 'my.ini'
$errorLog = Join-Path $base 'logs\mysql-error.log'

function Get-LocalMySqlProcess {
  Get-Process mysqld -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -and ($_.Path -ieq $mysqld) }
}

function Start-LocalMySql {
  if (-not (Test-Path $mysqld)) {
    throw "MySQL was not found at $mysqld. Install it first or set CAMPUSCONNECT_MYSQL_HOME."
  }
  if (-not (Test-Path $myini)) {
    throw "MySQL config was not found at $myini."
  }

  $running = Get-LocalMySqlProcess
  if ($running) {
    Write-Host "MySQL is already running (PID $($running.Id -join ', '))."
    return
  }

  Start-Process -FilePath $mysqld -ArgumentList "--defaults-file=$myini" -WindowStyle Hidden | Out-Null

  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) {
      Write-Host 'MySQL started on 127.0.0.1:3306.'
      return
    }
  }

  throw "MySQL did not start. Check $errorLog."
}

function Stop-LocalMySql {
  $running = Get-LocalMySqlProcess
  if (-not $running) {
    Write-Host 'MySQL is not running.'
    return
  }

  if (Test-Path $mysqladmin) {
    & $mysqladmin --protocol=tcp -h 127.0.0.1 -P 3306 -u root shutdown 2>$null | Out-Null
  }

  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    if (-not (Get-LocalMySqlProcess)) {
      Write-Host 'MySQL stopped.'
      return
    }
  }

  Get-LocalMySqlProcess | Stop-Process -Force
  Write-Host 'MySQL stopped (forced).'
}

function Get-LocalMySqlStatus {
  $running = Get-LocalMySqlProcess
  if ($running) {
    Write-Host "MySQL is running (PID $($running.Id -join ', ')) on 127.0.0.1:3306."
  } else {
    Write-Host 'MySQL is not running.'
  }
}

switch ($Action) {
  'start' { Start-LocalMySql }
  'stop' { Stop-LocalMySql }
  'restart' {
    Stop-LocalMySql
    Start-Sleep -Seconds 2
    Start-LocalMySql
  }
  'status' { Get-LocalMySqlStatus }
}
