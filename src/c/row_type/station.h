#pragma once

#include "../menu/row.h"
#include "pebble.h"

typedef Row Station;

extern Station *station_create_blank();
extern Station *station_create(DictionaryIterator *iter);
extern void station_destroy(Station *station);
