#pragma once

#include "../menu/row.h"
#include "pebble.h"

typedef Row Error;

extern Error *error_create(DictionaryIterator *iter);
extern void error_destroy(Error *error);
