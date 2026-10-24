# Candidate reproduction scope

The genesis replay was executed twice on the RTX 3070: by the packaging builder and by a separate builder using a clean export of the public subproject at commit `3b703f6a2cd5227c497de2a02bfb693c9fe4d829`, with the exact candidate kit overlaid.

Both executions rebuilt the CUDA evaluators and SHA-256 primitive, regenerated all four closures and compared the full canonical outputs. Each recorded sixteen SAME comparisons and three IF_THEN capture-transport negative controls.

The complete committed genesis is 382131 bytes:

`FDA614876C99126FCE2AFE6AC8E42A77863880485E02D4B4EDA4AA817446BD2C`

| Record | SHA-256 |
|---|---|
| PRIMARY_GENESIS_RECEIPT.json | BDC284C1F43621EA69A6098AB4A0B7F9FA6095770A3439E9A19CBE2E5CF95212 |
| SEPARATE_GENESIS_RECEIPT.json | 6CF2D973061A0973593A3CF2590549A847A68CE8360A753A9D26823ACD29EEBF |
| SEPARATE_BUILDER_REPORT.json | F6264469A624C9DCBE1269459541733B813E0729A51C0DD4AA43D1F1EFEAFBC5 |

The second builder did not implement another executor and did not use another device. This is isolated reproduction of the packaged implementation, not independent-backend conformance. Both used Node 22.20.0, CUDA 13.2, Windows and driver 596.36. Detailed commands and binary custody are in the receipts.

The candidate kit is not yet committed or published. Ordinary clone attempts met Windows long-path and unrelated partial-clone object problems; the separate builder preserved those attempts and used a clean Git subtree export instead. Therefore a fresh clone of a published kit commit remains an unwitnessed distribution check. No private corpus path was needed for replay.

The captured event is frozen input; this replay does not capture a new hardware event. Negative controls concern capture custody and decoding only. V1/V2, J17 link 2, and other GPU backends do not inherit this genesis result.

## J17 link 2: separate execution receipts

Both builders subsequently ran the portable J17 continuation using their own generated genesis. Each rebuilt the runtime, regenerated the occurrence inventory and primitive responses, and matched all thirteen complete stage readbacks. Each receipt records 315 custody/output comparisons, all SAME.

| Canonical output | SHA-256 |
|---|---|
| Program, including twelve routes | 6A2A2B384638C6983C20F708D059B6538AB4AAA9D1F468F460A961EBEF7FC529 |
| Fabric successor | D41166EC3BC832AFA306D05E2F5E57E960FA635A1C4916A50381F3DB6A167C47 |
| Committed world | E44759E517D2A381342003C74FFB3C8369C4B0A3167E92A4842D8553A27DD059 |

Primary receipt: `AD7A0E114F3AABD72E73345863D05D153873122ECB8B627F1FB8E35954915474`.
Separate-builder receipt: `5B8777B6C37FAD7AE2F3E774EDD6294B3CE20FFDE40903E75E76F98BF8C439A8`.

This is a world-field fixed point with a new committed link and changed fabric custody. It is not a tick-3 admission result. Same device/implementation limits remain. These executions are separate from the frozen empty-route V1/V2 contract.

The primary packaging trial first stopped before execution on a mistyped genesis path, then on an omitted telemetry include. Both failed outputs were retained outside the immutable kit. Adding the exact original include supplied the build dependency; no CUDA or world law was changed.

The archived-evidence seal was checked against HEAD `3b703f6a2cd5227c497de2a02bfb693c9fe4d829`: all 901 frozen files SAME, plus the 353 original files represented by the 021–023 seal (360 stored members, 17 gzip archives). The seal manifest is `9BA3BA4F6B4E91467B49875D917921180A91D0828155719EAC68B1C9DA672515`.
