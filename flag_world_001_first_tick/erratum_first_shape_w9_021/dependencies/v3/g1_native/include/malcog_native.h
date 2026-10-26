#ifndef MALCOG_NATIVE_H
#define MALCOG_NATIVE_H

#include <stdint.h>
#include <stddef.h>

/* Frozen constants from greenfield reference */
#define MAL_OPMODE_COUNT 25
#define MAL_SEXTUPLE_LABEL_COUNT 11
#define MAL_FAIL_MODE_COUNT 22
#define MAL_ROUTING_TABLE_COUNT 24
#define MAL_REALIZATION_TABLE_COUNT 24

#define MAL_MAX_TOKENS 4096
#define MAL_MAX_DOMAINS 64
#define MAL_MAX_SEEDS 64
#define MAL_MAX_MOTIFS 1024
#define MAL_MAX_LAWS 128
#define MAL_MAX_TRACE 4096
#define MAL_MAX_TEXT 256

typedef struct {
  char text[MAL_MAX_TEXT];
} Token;

typedef struct {
  char name[MAL_MAX_TEXT];
  uint32_t face;
} DomainRecord;

typedef struct {
  char authority[MAL_MAX_TEXT];
  char name[MAL_MAX_TEXT];
} SeedRecord;

typedef struct {
  char id[MAL_MAX_TEXT];
  char raw[MAL_MAX_TEXT];
  char verdict[16]; /* HOLDS | FAILS | UNDECIDABLE */
} MotifRecord;

typedef struct {
  char name[MAL_MAX_TEXT];
  char antecedent[MAL_MAX_TEXT];
  char consequent[MAL_MAX_TEXT];
} LawRecord;

typedef struct {
  char node[MAL_MAX_TEXT];
  char state[MAL_MAX_TEXT];
  char what[MAL_MAX_TEXT];
  char which[MAL_MAX_TEXT];
  char how[MAL_MAX_TEXT];
  char where_[MAL_MAX_TEXT];
  char when_[MAL_MAX_TEXT];
  char for_what[MAL_MAX_TEXT];
  char whence[MAL_MAX_TEXT];
} WitnessWhence;

typedef struct {
  char proof[MAL_MAX_TEXT];
  char grounds[MAL_MAX_TEXT];
  char state_pre[MAL_MAX_TEXT];
  char state_post[MAL_MAX_TEXT];
  char whence_unit[MAL_MAX_TEXT];
} BecauseArrow;

typedef struct {
  uint64_t cycle;
  uint64_t discharge_count;
  uint64_t holds_count;
  uint64_t fails_count;
  uint64_t undecidable_count;
  char normal_form_hash[65];
} WorldlineState;

#endif
