#include "departure.h"

#include "pebble.h"
#include "../menu/row.h"

Departure *departure_create() {
    return calloc(1, sizeof(Departure));
}

void departure_destroy(Departure *departure) {
    free(departure);
}

Row *departure_convert(void *data) {
    Departure *departure = data;

    Row *row = row_create();

    if (departure->time_left > 0) {
        snprintf(row->title, 32, "%dmin - %s", departure->time_left, departure->departure_time);
    } else {
        snprintf(row->title, 32, "Nu - %s", departure->departure_time);
    }

    memcpy(row->subtitle, departure->subtitle, 32);

    return row;
}