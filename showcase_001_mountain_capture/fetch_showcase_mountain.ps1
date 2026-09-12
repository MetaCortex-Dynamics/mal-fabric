$ErrorActionPreference = "Stop"

$repo = "C:\Dev\mal_kernel_lab_repo\v3\software_fpga"
$dstDir = Join-Path $repo "showcase_001_mountain_capture\assets"
$dst = Join-Path $dstDir "mountain_10k.splat"

$url = "https://raw.githubusercontent.com/marcelpadilla/splats/ac7f3850ceadbc0483d10c9f0b597c2ba5e89009/data/mountain/mountain_10k.splat"

$expectedSha = "ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41"
$expectedBytes = 320000
$expectedSplats = 10000

New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
Invoke-WebRequest -Uri $url -OutFile $dst

$actualBytes = (Get-Item $dst).Length
$actualSha = (Get-FileHash $dst -Algorithm SHA256).Hash.ToUpperInvariant()

if (($actualBytes % 32) -ne 0) {
    throw "FAIL: byte count is not divisible by 32: $actualBytes"
}

$actualSplats = [int]($actualBytes / 32)

if ($actualBytes -ne $expectedBytes) {
    throw "FAIL: byte count mismatch. expected=$expectedBytes actual=$actualBytes"
}
if ($actualSplats -ne $expectedSplats) {
    throw "FAIL: splat count mismatch. expected=$expectedSplats actual=$actualSplats"
}
if ($actualSha -ne $expectedSha) {
    throw "FAIL: SHA-256 mismatch. expected=$expectedSha actual=$actualSha"
}
if ($actualBytes -gt 1048576) {
    throw "FAIL: exceeds SHOWCASE-001 1 MiB gate"
}
if ($actualSplats -gt 32768) {
    throw "FAIL: exceeds SHOWCASE-001 32,768-splat gate"
}

Write-Host ""
Write-Host "SHOWCASE_ASSET := ADMISSIBLE"
Write-Host "LOCAL_PATH     := $dst"
Write-Host "BYTES          := $actualBytes"
Write-Host "SPLATS         := $actualSplats"
Write-Host "SHA-256        := $actualSha"
Write-Host "LICENSE        := CC-BY-4.0"
Write-Host ""
