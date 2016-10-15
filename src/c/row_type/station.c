#include "station.h"

#include "../menu/row.h"
#include "pebble.h"

enum StationEnum {
    // 0, 1, 2 allocated for AppMessageEnum
    TITLE = 3
};

Station *station_create_blank() {
    Station *station = calloc(1, sizeof(Station));
    return station;
}

Station *station_create(DictionaryIterator *iter) {
    Station *station = calloc(1, sizeof(Station));

    Tuple *title_tuple = dict_find(iter, TITLE);
    memcpy(station->title, title_tuple->value->cstring, title_tuple->length);

    return station;
}

void station_destroy(Station *station) {
    free(station);
}

Row *station_convert(void *data) {
    Station *station = data;

    Row *row = row_create();
    memcpy(row->title, station->title, 64);

    return row;
}