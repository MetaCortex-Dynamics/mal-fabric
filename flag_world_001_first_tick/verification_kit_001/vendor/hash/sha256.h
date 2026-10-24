#ifndef MALCOG_SHA256_H
#define MALCOG_SHA256_H

#include <stdint.h>

void malcog_sha256(const uint8_t *data, uint32_t len, uint8_t out[32]);

#endif
