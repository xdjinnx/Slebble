#pragma once

#include "pebble.h"

typedef struct Departure {
    uint16_t time_left;
    char departure_time[32];
} Departure;

extern Departure *departure_create();