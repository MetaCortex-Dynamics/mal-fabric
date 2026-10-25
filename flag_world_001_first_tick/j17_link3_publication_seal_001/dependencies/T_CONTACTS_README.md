# T carrier input custody supplement

Five carrier-012 inputs are carried here BECAUSE T's original `INPUTS.json` names external paths and their exact bytes are not stored by the prior frozen manifests. The bound files are incidence source, junction-identity source, the parent readback, QG-003 carrier, and motif table. This is byte transport, not a new construction or admission.

The original T record is unchanged. `T_CONTACTS_MANIFEST.json` maps each source path to an exact raw copy or one gzip file smaller than 40 MiB. The original identities, storage identities, and decoded identities are checked separately. `T_CONTACTS_SHA256SUMS` binds this supplement's files independently of the earlier 42-file dependency seal, which is untouched.

`node t_contacts.mjs verify` uses stored bytes only. `verify-originals` also rehashes the external source files. `restore` writes only under `dependencies/t_contacts/restored/`, never to the source carrier or any world file; an existing destination must be SAME. No GPU or Python is invoked.
