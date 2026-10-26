[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$InputFile,
  [Parameter(Mandatory=$true)][ValidateSet('specification','erratum')][string]$RecordKind,
  [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
& node (Join-Path $PSScriptRoot 'erratum_first_shape_promotion_024/check_form_promote.mjs') --input $InputFile --kind $RecordKind --out $OutputDirectory
exit $LASTEXITCODE
