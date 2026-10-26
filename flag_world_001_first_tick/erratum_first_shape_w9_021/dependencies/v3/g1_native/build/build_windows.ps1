param(
  [string]$OutDir = "v3/g1_native/out",
  [string]$CC = ""
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force $OutDir | Out-Null

$src = "v3/g1_native/src/native_discharger.c"
$out = Join-Path $OutDir "malcog_g1.exe"

# Pragmatic G1-B step: native PE with minimal boundary, no heap required by source.
if (-not $CC) {
  foreach ($candidate in @("clang", "gcc", "cl")) {
    if (Get-Command $candidate -ErrorAction SilentlyContinue) {
      $CC = $candidate
      break
    }
  }
}
if (-not $CC) {
  throw "No compiler found (clang/gcc/cl)."
}

if ($CC -eq "cl") {
  & cl /nologo /O2 /MT $src /link /subsystem:console kernel32.lib /out:$out
  if ($LASTEXITCODE -ne 0) { throw "cl build failed ($LASTEXITCODE)" }
} else {
  $isGcc = ($CC -like "*gcc*")
  $args = @(
    $src,
    "-O2",
    "-ffreestanding",
    "-fno-builtin",
    "-lkernel32",
    "-o",
    $out
  )
  if ($isGcc) {
    $args = @(
      $src,
      "-O2",
      "-ffreestanding",
      "-fno-builtin",
      "-lkernel32",
      "-o",
      $out
    )
  } else {
    $args = @(
      $src,
      "-O2",
      "-ffreestanding",
      "-fno-builtin",
      "-lkernel32",
      "-o",
      $out
    )
  }
  & $CC @args
  if ($LASTEXITCODE -ne 0) { throw "$CC build failed ($LASTEXITCODE)" }
}

Write-Host "built: $out"
