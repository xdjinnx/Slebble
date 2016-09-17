#pragma once

#include "pebble.h"
#include "../menu/row.h"

typedef struct Station {
    char title[64];
} Station;

extern Station *station_create_blank();
extern Station *station_create(DictionaryIterator *iter);
extern void station_destroy(Station *station);
extern Row *station_convert(void *data);
