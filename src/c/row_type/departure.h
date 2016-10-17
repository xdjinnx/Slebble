#pragma once

#include "../menu/row.h"
#include "pebble.h"

typedef Row Departure;

extern Departure *departure_create(DictionaryIterator *iter);
extern void departure_destroy(Departure *departure);
extern void departure_decrease_time_left(Departure *departure);
