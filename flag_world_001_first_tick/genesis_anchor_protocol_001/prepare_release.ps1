param(
  [Parameter(Mandatory=$true)][string]$Stage,
  [Parameter(Mandatory=$true)][string]$Zip,
  [Parameter(Mandatory=$true)][string]$AdapterEvidence,
  [Parameter(Mandatory=$true)][string]$BoundaryEvidence
)
$ErrorActionPreference = 'Stop'
$proto = $PSScriptRoot
$subproject = Split-Path $proto -Parent
$stagePath = [IO.Path]::GetFullPath($Stage)
$zipPath = [IO.Path]::GetFullPath($Zip)
if ((Test-Path -LiteralPath $stagePath) -or (Test-Path -LiteralPath $zipPath)) { throw 'Fresh stage and ZIP paths required' }
[IO.Directory]::CreateDirectory($stagePath) | Out-Null
[IO.Directory]::CreateDirectory((Split-Path $zipPath -Parent)) | Out-Null
$rows = [Collections.Generic.List[object]]::new()
function Carry([string]$Source, [string]$Relative, [string]$Role) {
  $item = Get-Item -LiteralPath $Source
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Link refused: $Source" }
  $target = [IO.Path]::GetFullPath((Join-Path $stagePath $Relative))
  if (-not $target.StartsWith($stagePath + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Target outside stage' }
  [IO.Directory]::CreateDirectory((Split-Path $target -Parent)) | Out-Null
  [IO.File]::Copy($item.FullName, $target, $false)
  $before = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash
  $after = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash
  if ($before -ne $after) { throw "NOT_SAME $Relative" }
  $rows.Add([ordered]@{path=$Relative.Replace('\','/');bytes=$item.Length;sha256=$before;role=$Role})
}
function CarryTree([string]$SourceRoot, [string]$Prefix, [string]$Role) {
  $resolved = [IO.Path]::GetFullPath($SourceRoot)
  foreach ($entry in Get-ChildItem -LiteralPath $resolved -Force) {
    if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Link refused: $($entry.FullName)" }
    if ($entry.PSIsContainer) { CarryTree $entry.FullName ($Prefix+'/'+$entry.Name) $Role }
    else { Carry $entry.FullName ($Prefix+'/'+$entry.Name) $Role }
  }
}
CarryTree $proto 'flag_world_001_first_tick/genesis_anchor_protocol_001' 'protocol_implementation_and_records'
CarryTree (Join-Path $subproject 'verification_kit_001') 'flag_world_001_first_tick/verification_kit_001' 'released_kit_unchanged'
$record = Get-Content -LiteralPath (Join-Path $proto 'RUN_RECORD_ARCHIVED_ADAPTERS_001.json') -Raw | ConvertFrom-Json
foreach ($p in $record.provenance) {
  if (-not $p.path.StartsWith('archive/')) { throw 'Archive path' }
  if ((Get-FileHash -LiteralPath $p.source -Algorithm SHA256).Hash -ne $p.sha256) { throw "NOT_SAME original $($p.source)" }
  Carry $p.source ('recorded_genesis/'+$p.path.Substring(8)) 'original_receipt_bound_GPU_output'
}
CarryTree (Join-Path $AdapterEvidence 'evidence') 'qualification/adapters/evidence' 'new_API_integration_evidence'
foreach ($f in Get-ChildItem -LiteralPath $AdapterEvidence -File) {
  if ($f.Name -eq 'RUN_RECORD.json' -or $f.Name.EndsWith('.response.json')) { Carry $f.FullName ('qualification/adapters/'+$f.Name) 'new_API_integration_response' }
}
CarryTree (Join-Path $BoundaryEvidence 'evidence') 'qualification/boundary/evidence' 'new_boundary_regression_evidence'
Carry (Join-Path $BoundaryEvidence 'RUN_RECORD.json') 'qualification/boundary/RUN_RECORD.json' 'new_boundary_regression_record'
$manifest = [ordered]@{
  schema='GAP_ARCHIVED_RELEASE_MANIFEST_V1'; scope='ARCHIVED_JTP_CAPTURE_ONLY'; version='0.1.0';
  spec_sha256='70D374000A4A8E17E3C481F4B7C46415C01871813A4A70FF0634F57FC5057C3C';
  discharge_sha256='2C2122C3FEF25DB0645FC999FB7DB891EDD246FBE906DFD41A55D02F6C782FA4';
  reference_zip_sha256='701279395704DAA51AA4C0909F90B1C19959558943AA93096E850C5AC89114B8';
  files=@($rows | Sort-Object path)
}
$json = ($manifest | ConvertTo-Json -Depth 8) + "`n"
[IO.File]::WriteAllText((Join-Path $stagePath 'RELEASE_MANIFEST.json'), $json, [Text.UTF8Encoding]::new($false))
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$stream = [IO.File]::Open($zipPath,[IO.FileMode]::CreateNew)
$archive = [IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Create,$false)
try {
  $paths = @('RELEASE_MANIFEST.json') + @($manifest.files.path)
  foreach ($rel in ($paths | Sort-Object)) {
    $entry = $archive.CreateEntry($rel,[IO.Compression.CompressionLevel]::Optimal)
    $entry.LastWriteTime = [DateTimeOffset]::new(2000,1,1,0,0,0,[TimeSpan]::Zero)
    $dest = $entry.Open(); $src = [IO.File]::OpenRead((Join-Path $stagePath $rel))
    try { $src.CopyTo($dest) } finally { $src.Dispose(); $dest.Dispose() }
  }
} finally { $archive.Dispose(); $stream.Dispose() }
[ordered]@{files=$rows.Count;zip=$zipPath;zip_sha256=(Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash;manifest_sha256=(Get-FileHash -LiteralPath (Join-Path $stagePath 'RELEASE_MANIFEST.json') -Algorithm SHA256).Hash} | ConvertTo-Json
