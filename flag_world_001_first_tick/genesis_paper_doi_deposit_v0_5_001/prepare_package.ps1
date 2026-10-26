$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$taskArchivePath = Join-Path $taskRoot 'Genesis_on_the_GPU_v0.5_DOI_deposit.zip'
$taskManifest = Get-Content -LiteralPath (Join-Path $taskRoot 'upload/MANIFEST.json') -Raw | ConvertFrom-Json
$taskMetadata = Get-Content -LiteralPath (Join-Path $taskRoot 'ZENODO_DEPOSIT_METADATA.json') -Raw | ConvertFrom-Json
$taskPlan = Get-Content -LiteralPath (Join-Path $taskRoot 'DEPOSIT_PLAN.json') -Raw | ConvertFrom-Json

foreach ($taskItem in $taskManifest.files) {
    $taskFile = Join-Path $taskRoot ('upload/' + $taskItem.path)
    if ((Get-FileHash -LiteralPath $taskFile -Algorithm SHA256).Hash -ne $taskItem.sha256 -or (Get-Item -LiteralPath $taskFile).Length -ne $taskItem.bytes) {
        throw ('NOT-SAME upload file: ' + $taskItem.path)
    }
}
$taskRequired = @('title','upload_type','publication_type','publication_date','creators','description','access_right','license','version')
foreach ($taskField in $taskRequired) { if (-not $taskMetadata.metadata.$taskField) { throw ('Missing metadata field: ' + $taskField) } }
if ($taskMetadata.metadata.license -ne 'Apache-2.0') { throw 'License NOT-SAME Devon attestation.' }
if ($taskMetadata.metadata.PSObject.Properties.Name -contains 'doi') { throw 'No paper DOI is assigned in this preparation.' }
if ($taskMetadata.metadata.upload_type -ne 'publication' -or $taskMetadata.metadata.publication_type -ne 'preprint') { throw 'Resource type NOT-SAME prepared preprint metadata.' }

$taskPublication = Join-Path (Split-Path $taskRoot -Parent) 'genesis_paper_publication_v0_5_001/GENESIS_ON_THE_GPU_v0.5_publication.md'
$taskSourceText = [IO.File]::ReadAllText($taskPublication)
$taskAbstract = [regex]::Match($taskSourceText, '(?s)# Abstract\r?\n\r?\n(.*?)\r?\n\r?\n# 1\. Introduction').Groups[1].Value.Trim()
$taskDescription = [Net.WebUtility]::HtmlDecode(($taskMetadata.metadata.description -replace '^<p>|</p>$',''))
if ($taskAbstract -cne $taskDescription) { throw 'Abstract NOT-SAME publication edition.' }

$taskFiles = @($taskPlan.files_to_upload) + @($taskPlan.local_helpers)
$taskFiles = @($taskFiles | Sort-Object)
if (($taskFiles | Select-Object -Unique).Count -ne 12) { throw 'Package must contain exactly twelve named files.' }
if (Test-Path -LiteralPath $taskArchivePath) { throw 'Package already present; retain it rather than silently overwrite it.' }

$taskOutput = [IO.File]::Open($taskArchivePath, [IO.FileMode]::CreateNew)
try {
    $taskZip = [IO.Compression.ZipArchive]::new($taskOutput, [IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        foreach ($taskRelative in $taskFiles) {
            $taskEntry = $taskZip.CreateEntry($taskRelative.Replace('\','/'), [IO.Compression.CompressionLevel]::Optimal)
            $taskEntry.LastWriteTime = [DateTimeOffset]::Parse('2026-10-26T00:00:00+00:00')
            $taskInput = [IO.File]::OpenRead((Join-Path $taskRoot $taskRelative))
            $taskEntryOutput = $taskEntry.Open()
            try { $taskInput.CopyTo($taskEntryOutput) }
            finally { $taskInput.Dispose(); $taskEntryOutput.Dispose() }
        }
    } finally { $taskZip.Dispose() }
} finally { $taskOutput.Dispose() }

$taskRows = @()
$taskReadZip = [IO.Compression.ZipFile]::OpenRead($taskArchivePath)
try {
    if ($taskReadZip.Entries.Count -ne 12) { throw 'Archive entry count NOT-SAME.' }
    foreach ($taskEntry in $taskReadZip.Entries) {
        if ($taskEntry.FullName -notin $taskFiles) { throw ('Unexpected archive entry: ' + $taskEntry.FullName) }
        $taskReadStream = $taskEntry.Open()
        $taskHasher = [Security.Cryptography.SHA256]::Create()
        try { $taskReadHash = [Convert]::ToHexString($taskHasher.ComputeHash($taskReadStream)) }
        finally { $taskReadStream.Dispose(); $taskHasher.Dispose() }
        $taskDisk = Join-Path $taskRoot $taskEntry.FullName
        if ($taskReadHash -ne (Get-FileHash -LiteralPath $taskDisk -Algorithm SHA256).Hash -or $taskEntry.Length -ne (Get-Item -LiteralPath $taskDisk).Length) {
            throw ('Archive readback NOT-SAME: ' + $taskEntry.FullName)
        }
        $taskRows += [pscustomobject]@{path=$taskEntry.FullName;bytes=$taskEntry.Length;sha256=$taskReadHash;reading='SAME'}
    }
} finally { $taskReadZip.Dispose() }

[pscustomobject]@{
    schema='GENESIS_DOI_PACKAGE_REVIEW_001'
    package=[pscustomobject]@{path=[IO.Path]::GetFileName($taskArchivePath);bytes=(Get-Item -LiteralPath $taskArchivePath).Length;sha256=(Get-FileHash -LiteralPath $taskArchivePath -Algorithm SHA256).Hash}
    checks=[pscustomobject]@{source_copies='6/6 SAME';upload_files=8;archive_entries=12;archive_readback='12/12 SAME';abstract='VERBATIM_SAME';license='Apache-2.0';metadata='REQUIRED_FIELDS_PRESENT; SERVER_SUBMISSION_NOT_RUN';paper_doi='NOT_ASSIGNED';external_mutations='NONE'}
    entries=$taskRows
} | ConvertTo-Json -Depth 6
