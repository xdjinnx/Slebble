#pragma once

#include "../menu/row.h"
#include "pebble.h"

typedef struct Station {
    char title[64];
} Station;

extern Station *station_create_blank();
extern Station *station_create(DictionaryIterator *iter);
extern void station_destroy(Station *station);
extern Row *station_convert(void *data);
