#pragma once

#include "pebble.h"
#include "../menu/row.h"

typedef struct Departure {
    char subtitle[64];

    uint16_t time_left;
    char departure_time[64];
} Departure;

extern Departure *departure_create(DictionaryIterator *iter);
extern void departure_destroy(Departure *departure);
extern Row *departure_convert(void *data);
