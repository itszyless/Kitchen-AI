$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDirectory
New-Item -ItemType Directory -Path '.expo' -Force | Out-Null
$trustedRoots = Get-ChildItem Cert:\LocalMachine\Root,Cert:\CurrentUser\Root
$certificateText = ($trustedRoots | ForEach-Object { "-----BEGIN CERTIFICATE-----`n" + [Convert]::ToBase64String($_.RawData, [Base64FormattingOptions]::InsertLineBreaks) + "`n-----END CERTIFICATE-----" }) -join "`n"
$certificatePath = Join-Path $projectDirectory '.expo\windows-trusted-roots.pem'
[IO.File]::WriteAllText($certificatePath, $certificateText)
$env:NODE_EXTRA_CA_CERTS = $certificatePath
if (-not (Test-Path -LiteralPath 'node_modules')) { npm.cmd ci; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
npm.cmd start
