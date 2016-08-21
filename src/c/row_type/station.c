#include "station.h"

#include "pebble.h"
#include "../menu/row.h"

enum StationEnum {
        // 0, 1, 2 allocated for AppMessageEnum
        TITLE = 3
    };

Station *station_create(DictionaryIterator *iter) {
    Station *station = calloc(1, sizeof(Station));

    Tuple *title_tuple = dict_find(iter, TITLE);
    //APP_LOG(APP_LOG_LEVEL_INFO, "Station: %s, Length: %d", title_tuple->value->cstring, title_tuple->length);
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