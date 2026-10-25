# Custody-only: hash files, copy exact attachment/archive members, bind readout.
# No source evaluation, Python execution, GPU/board action or worldline mutation.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskJtp = 'C:/Users/devon/Documents/Codex/2026-10-19/https-github-com-metacortex-dynamics-ships/work/Ships-Computer/v3/junction_transaction_protocol'
$taskCorpus = 'C:/Users/devon/Desktop/MaL'
function Identity([string]$taskPath) {
    $taskItem = Get-Item -LiteralPath $taskPath
    [ordered]@{path=$taskItem.FullName;bytes=$taskItem.Length;sha256=(Get-FileHash -LiteralPath $taskPath -Algorithm SHA256).Hash}
}
$taskContacts = @(
    @('RECORD_V011', "$taskCorpus/MaLv3/RECORD_J17_REACTION_PDPE_001.mal", 'B5DBC1EF843B9203EE9F7434651B2ABF66059D83D38565DFD13501A2C1BCCA88'),
    @('ENGINE', "$taskRoot/world_transition_contacts_007/contacts/Markdowns/SPEC_FLAG_WORLD_ENGINE_V3_001_v0.2.0.md", 'B2A3CE4E4639B53EDC10573F54DF8F8CBD0351D67670790F28F1313190ED924C'),
    @('A1_A10', "$taskRoot/world_transition_contacts_007/contacts/Markdowns/PROMOTION_RECORD_A1-A10.md", '27C995BDB06B1AE6F87D727FFD0853AD3DF0ADEA13428D1EBF0B9A06FB0BB805'),
    @('A4_ARCHIVE', "$taskCorpus/Compressed/forced_flag_system_clean.zip", 'FF0F1FA2493A6EA0A4CAA2B5B28937FEA25F4DC77141ACEA49CCF48C8B9A6FE4'),
    @('SHELL', "$taskCorpus/The_Projection_Shell_v1.0_PROMOTED.docx", '6BB690028AA733983A0B5F214C09204DB2821E71036A3412FE2F710559C6A0CE'),
    @('PROTO', "$taskCorpus/Proto_Transitions_MaL_Framework_Expanded.docx", '74D477BF290C76AD339DCCF5F3125934FA2BBC92745A7DC7721730D0C3282601'),
    @('TANG012_IMAGE', "$taskJtp/evidence/QG-JTP-TANG-PERSISTENCE-RX-DRAIN-012/pre-execution/artifacts/qg-jtp-tang-persistence-rx-drain-012.fs", 'C232080AA842069554989B6FB62F49F979EFE444B1CD45F9467F768BA87385F7'),
    @('TANG019_IMAGE', "$taskJtp/evidence/QG-JTP-TANG-AUTHORITY-POSTMORTEM-019/pre-execution/artifacts/qg-jtp-tang-authority-postmortem-019.fs", '859C81A473EE0669D45A38D77EF2D014347D9270F7CE14026CDED3D9D5C56DE3'),
    @('TANG012_SOURCE', "$taskJtp/firmware/qg-jtp-tang-persistence-rx-drain-012/jtp_bridge.c", '29104CC8494D09CFDBC2056ADD87B5B0084FF4E36476AA2A12B6868FB27B310E'),
    @('TANG019_SOURCE', "$taskJtp/firmware/qg-jtp-tang-authority-postmortem-019/jtp_bridge.c", '434D95A1C8E1B3B80AFD630BFCEFBD56F59623BA95A89B802B2B9EFB360CFA18'),
    @('TANG_SOURCE_AUDIT', "$taskJtp/evidence/QG-JTP-TANG-PERSISTENCE-RX-DRAIN-012/production-vs-authority-postmortem-readonly-audit-001/audit.json", 'D5C7DB492AB79071E6264AF0E6BD4E6FD4BE2D313EBFCD9327602B2F185FC786'),
    @('JTP_HEADER', "$taskJtp/runtime/common/jtp_v1.h", 'D1D745FE64F9422DD802E3E3A31EDD5BE81BE49505E02697F163F82D78AAF9CB'),
    @('G2', "$taskRoot/j17_step_023/outputs/committed.world.json", 'E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059'),
    @('RUN010', 'D:/mal_worldline_backups/j17_fibre_diagnostic_010/run_001/RUN_RECORD_010.json', '2AD351F73AF9C7046C6883E0EF1C29180F272DAF9EDE5047630E242743F9A053'),
    @('RUN011', 'D:/mal_worldline_backups/j17_pair_diagnostic_011/run_001/RUN_RECORD_011.json', '35334015AC81697383480FAE210DE3CC1AF06FEBD75079761E280BCF948EE518'),
    @('NATIVE010', "$taskRoot/j17_fibre_diagnostic_010/source/fibres.mal", 'C67825AC67B279C82B45A90BB403E11E25311A0B04FAB6F1758E08C8F0644B87'),
    @('NATIVE011', "$taskRoot/j17_pair_diagnostic_011/source/pairs.mal", '5912EA3812221BE1CBFE2414033474576244F7534AD4E8DD6F51AE212A5B4E95')
)
$taskBound = @()
foreach ($taskContact in $taskContacts) {
    $taskIdentity = Identity $taskContact[1]
    if ($taskIdentity.sha256 -ne $taskContact[2]) { throw "NOT_SAME $($taskContact[0])" }
    $taskBound += [ordered]@{id=$taskContact[0];identity=$taskIdentity;comparison='SAME'}
}
$taskCopyDir = Join-Path $PSScriptRoot 'contacts'
if (Test-Path -LiteralPath $taskCopyDir) { throw 'PRESERVE_PRIOR_CONTACT_OUTPUT' }
New-Item -ItemType Directory -Path $taskCopyDir | Out-Null
$taskCopy = Join-Path $taskCopyDir 'RECORD_J17_REACTION_PDPE_001_v0.1.1.mal'
[IO.File]::Copy($taskContacts[0][1],$taskCopy,$false)
if ((Identity $taskCopy).sha256 -ne $taskContacts[0][2]) { throw 'COPY_NOT_SAME' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskZip = [IO.Compression.ZipFile]::OpenRead("$taskCorpus/Compressed/forced_flag_system_clean.zip")
try {
    foreach ($taskMember in @(
        @('A4_SOURCE','site_witness.py','A884AF2CFE6A8F1C8B252D6E18BF5D371DBC3FDFA515C0617C8CEBA04E4D1BE9'),
        @('A4_RECEIPT','site_witness.json','144BAB3FD98C8FA59F72175FF004DF40ED74782573584BF28F4077F067E861A1')
    )) {
        $taskEntry = $taskZip.GetEntry($taskMember[1])
        if ($null -eq $taskEntry) { throw 'ARCHIVE_MEMBER_NOT_LOCATED' }
        $taskDestination = Join-Path $taskCopyDir $taskMember[1]
        $taskInput = $taskEntry.Open()
        $taskOutput = [IO.File]::Open($taskDestination,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write)
        try { $taskInput.CopyTo($taskOutput) } finally { $taskOutput.Dispose(); $taskInput.Dispose() }
        $taskIdentity = Identity $taskDestination
        if ($taskIdentity.sha256 -ne $taskMember[2]) { throw "ARCHIVE_MEMBER_NOT_SAME $($taskMember[1])" }
        $taskBound += [ordered]@{id=$taskMember[0];archive_member=$taskEntry.FullName;identity=$taskIdentity;comparison='SAME';execution='NOT_RUN'}
    }
} finally { $taskZip.Dispose() }
$taskRecordPath = Join-Path $PSScriptRoot 'BINDINGS.json'
if (Test-Path -LiteralPath $taskRecordPath) { throw 'PRESERVE_PRIOR_BINDING' }
$taskRecord = [ordered]@{
    schema='J17GateReadingBinding012'
    inputs=$taskBound
    attachment_copy=(Identity $taskCopy)
    readout=(Identity (Join-Path $PSScriptRoot 'READOUT.json'))
    custody_script=(Identity $PSCommandPath)
    conclusions=[ordered]@{readings_branch='IF_THEN: A7 and D2';six_domain_kinds='IF_THEN: A4';constant_patch_offer_correspondence='MAYBE';link3='NOT_COMMITTED';new_personal_DECIDE='NONE'}
    effects=[ordered]@{original_edits=0;engine_runs=0;board_actions=0;worldline_appends=0;promotions=0;repository_commits=0;pushes=0}
}
$taskEncoding = [Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText($taskRecordPath,($taskRecord | ConvertTo-Json -Depth 20)+"`n",$taskEncoding)
Identity $taskRecordPath | ConvertTo-Json -Compress
