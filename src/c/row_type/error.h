#pragma once

#include "../menu/row.h"
#include "pebble.h"

typedef struct Error {
    char title[64];
    char subtitle[64];
} Error;

extern Error *error_create(DictionaryIterator *iter);
extern void error_destroy(Error *error);
extern Row *error_convert(void *data);
