#include "station.h"

#include "pebble.h"
#include "../menu/row.h"

Station *station_create() {
    return calloc(1, sizeof(Station));
}

void station_destroy(Station *station) {
    free(station);
}

Row *station_convert(void *data) {
    Station *station = data;

    Row *row = row_create();
    memcpy(row->title, station->title, 32);

    return row;
}