# Runs official Gno VM test suite across escrowmath and oathledger
param(
    [string]$GnoBin = "D:\Codex\Tools\gno-bin\gno.exe",
    [string]$GnoRoot = "D:\Codex\Tools\gno-src"
)

$pRel = "gno.land\p\g1ty0rp975ndkcse760v0zt659f4phs4z8lueud7\escrowmath"
$rRel = "gno.land\r\g1ty0rp975ndkcse760v0zt659f4phs4z8lueud7\oathledger"

$pDst = "$GnoRoot\examples\$pRel"
$rDst = "$GnoRoot\examples\$rRel"

if (Test-Path $pDst) { Remove-Item $pDst -Recurse -Force }
if (Test-Path $rDst) { Remove-Item $rDst -Recurse -Force }
New-Item -ItemType Directory -Force -Path $pDst, $rDst | Out-Null

Copy-Item "$PSScriptRoot\..\$pRel\*" $pDst -Recurse -Force
Copy-Item "$PSScriptRoot\..\$rRel\*" $rDst -Recurse -Force

Push-Location "$GnoRoot\examples"
& $GnoBin test -v "./gno.land/p/g1ty0rp975ndkcse760v0zt659f4phs4z8lueud7/escrowmath" "./gno.land/r/g1ty0rp975ndkcse760v0zt659f4phs4z8lueud7/oathledger"
$code = $LASTEXITCODE
Pop-Location
exit $code
