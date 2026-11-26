# One-click deploy OathLedger (escrowmath package + oathledger realm) to Gno.land Onyx Testnet (onyx-1)
# Prerequisite: Fund g1ty0rp975ndkcse760v0zt659f4phs4z8lueud7 via https://faucet.gno.land/ (select onyx-1)

$ErrorActionPreference = "Stop"
$env:HTTP_PROXY = "http://127.0.0.1:7892"
$env:HTTPS_PROXY = "http://127.0.0.1:7892"

$GNOKEY = "D:\Codex\Tools\gno-bin\gnokey.exe"
$KEY_HOME = "D:\Antigravity\Projects\oath-ledger\keys"
$KEY_NAME = "oathledger_deployer"
$PASS = "oathledger-testnet-only"
$ADDR = "g1ty0rp975ndkcse760v0zt659f4phs4z8lueud7"
$CHAIN_ID = "onyx-1"
$REMOTE = "https://rpc.onyx.testnets.gno.land:443"

$PKG_PATH = "gno.land/p/$ADDR/escrowmath"
$REALM_PATH = "gno.land/r/$ADDR/oathledger"
$PKG_DIR = "D:\Antigravity\Projects\oath-ledger\gno.land\p\$ADDR\escrowmath"
$REALM_DIR = "D:\Antigravity\Projects\oath-ledger\gno.land\r\$ADDR\oathledger"

Write-Host "=== Checking balance on onyx-1 for $ADDR ==="
& $GNOKEY query "bank/balances/$ADDR" --remote $REMOTE

Write-Host "`n[1/3] Deploying pure package $PKG_PATH ..."
"$PASS`n" | & $GNOKEY maketx addpkg `
  -pkgpath $PKG_PATH `
  -pkgdir $PKG_DIR `
  -gas-fee "1000000ugnot" `
  -gas-wanted "5000000" `
  -broadcast `
  -chainid $CHAIN_ID `
  -remote $REMOTE `
  --home $KEY_HOME `
  --insecure-password-stdin `
  $KEY_NAME

Write-Host "`n[2/3] Deploying stateful realm $REALM_PATH ..."
"$PASS`n" | & $GNOKEY maketx addpkg `
  -pkgpath $REALM_PATH `
  -pkgdir $REALM_DIR `
  -gas-fee "1000000ugnot" `
  -gas-wanted "10000000" `
  -broadcast `
  -chainid $CHAIN_ID `
  -remote $REMOTE `
  --home $KEY_HOME `
  --insecure-password-stdin `
  $KEY_NAME

Write-Host "`n[3/3] Seeding live showcase Pact #1 on onyx-1..."
"$PASS`n" | & $GNOKEY maketx call `
  -pkgpath $REALM_PATH `
  -func "CreatePact" `
  -args "Zero-Knowledge Merkle Verifier Package" `
  -args "Build and audit a pure Gno Merkle inclusion verifier with gnoweb documentation." `
  -args "Spec & Pure Math,Realm & Security Tests" `
  -args "4000,6000" `
  -args "$ADDR" `
  -args "1" `
  -args "168" `
  -send "2000000ugnot" `
  -gas-fee "1000000ugnot" `
  -gas-wanted "5000000" `
  -broadcast `
  -chainid $CHAIN_ID `
  -remote $REMOTE `
  --home $KEY_HOME `
  --insecure-password-stdin `
  $KEY_NAME

Write-Host "`nDEPLOYED LIVE ON ONYX-1!"
Write-Host "gnoweb URL: https://onyx.testnets.gno.land/r/$ADDR/oathledger"
